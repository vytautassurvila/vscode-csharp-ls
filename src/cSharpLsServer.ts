import { existsSync } from 'fs';
import * as path from 'path';
import * as os from 'os';
import { mkdir } from 'fs/promises';
import { DidChangeConfigurationNotification, LanguageClient, LanguageClientOptions, ServerOptions, StaticFeature } from 'vscode-languageclient/node';
import { ChildProcess, spawn } from 'child_process';
import { Disposable, ExtensionContext, workspace, window, commands, TextDocumentContentProvider, Uri, languages } from 'vscode';
import { csharpLsVersion } from './constants/csharpLsVersion';

let client: LanguageClient | undefined = undefined;
let configChangeListener: Disposable | undefined = undefined;

class MetadataUriFeature implements StaticFeature {
    fillClientCapabilities(capabilities: ClientCapabilities): void {
        capabilities.experimental = capabilities.experimental || {};
        capabilities.experimental.csharp = capabilities.experimental.csharp || {};
        capabilities.experimental.csharp.metadataUris = true;
    }
    initialize(): void {}
    dispose(): void {}
}

export async function startCSharpLsServer(
    extensionPath: string,
    solutionPath: string,
): Promise<void> {
    await stopCSharpLsServer();

    await ensureWeHaveDotnet();

    const csharpLsBinaryPath = await resolveCsharpLsBinaryPath(extensionPath);

    const slnWorkspaceFolder = workspace.workspaceFolders?.find(f => solutionPath.startsWith(f.uri.fsPath));
    const rootPath = slnWorkspaceFolder?.uri.fsPath ?? workspace.rootPath ?? '';
    const relativeSolutionPath = solutionPath.replace(rootPath, '').replace(/^[\/\\]/, '');

    // Build args array
    const args: string[] = [
        '--solution', relativeSolutionPath,
        '--features', 'razor-support',
    ];

    const rpcLogRaw = workspace.getConfiguration('csharp-ls').get('rpcLog') as string;
    const rpcLog = rpcLogRaw?.startsWith('~')
        ? path.join(os.homedir(), rpcLogRaw.slice(1))
        : rpcLogRaw;
    if (rpcLog) {
        args.push('--rpclog', rpcLog);
    }

    const csharpLsExecutable = {
        command: csharpLsBinaryPath,
        args,
        options: {
            cwd: rootPath,
        },
    };

    const serverOptions: ServerOptions = {
        run: csharpLsExecutable,
        debug: csharpLsExecutable,
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'csharp' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/*.{cs,cshtml,csproj}')
        },
        middleware: {
            workspace: {
                configuration: (params, token, next) => {
                    return params.items.map(item => {
                        if (item.section !== 'csharp') {
                            return next(params, token);
                        }
                        const cfg = workspace.getConfiguration('csharp-ls');
                        return {
                            applyFormattingOptions: cfg.get<boolean>('applyFormattingOptions', false),
                            analyzersEnabled: cfg.get<boolean>('analyzersEnabled', false),
                            razorSupport: true,
                            useMetadataUris: true,
                            solutionPathOverride: relativeSolutionPath,
                            debug: {
                                debugMode: cfg.get<boolean>('debugMode', false),
                            },
                        };
                    });
                },
            },
        },
    };

    client = new LanguageClient(
        'csharp-ls',
        'csharp-ls',
        serverOptions,
        clientOptions
    );

    registerTextDocumentContentProviders();

    client.registerFeature(new MetadataUriFeature());
    await client.start();

    configChangeListener?.dispose();
    configChangeListener = workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('csharp-ls')) {
            await client?.sendNotification(DidChangeConfigurationNotification.type, {
                settings: null,
            });
        }
    });
}

export async function stopCSharpLsServer(): Promise<void> {
    configChangeListener?.dispose();
    configChangeListener = undefined;

    if (!client) {
        return;
    }

    await client.stop();
    client = undefined;
}

export async function getTargetSolutionPaths(): Promise<string[]> {
    const solutionFiles = await workspace.findFiles(
        '{**/*.sln}',
        '{**/node_modules/**,**/.git/**}');

    return solutionFiles.map(f => f.path);
}

export async function autostartCSharpLsServer(context: ExtensionContext): Promise<void> {
    const previousSolution = await context.workspaceState.get('lastSolutionPathOrFolder') as string;

    if (previousSolution) {
        await startCSharpLsServer(context.extensionPath, previousSolution);
        return;
    }

    const targetSolutions = await getTargetSolutionPaths();

    if (targetSolutions.length === 1) {
        await startCSharpLsServer(context.extensionPath, targetSolutions[0]);
        return;
    }

    if (targetSolutions.length > 1) {
        const selectSolution = await window.showInformationMessage('More than one solution detected', 'Select solution');

        if (selectSolution) {
            commands.executeCommand('csharp-ls.selectSolution');
            return;
        }
    }
}

function shellExec(command: string, args: string[], cwd: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        let childprocess: ChildProcess;
        try {
            childprocess = spawn(command, args, { cwd });
        }
        catch (e) {
            console.error(`shellExec: '${command}' error: '${e}'`);
            return reject(String(e));
        }

        childprocess.stderr!.on('data', function (error: any) {
            console.error('spawn', command, args, cwd, error.toString());
            reject(error.toString());
        });

        let stdout = '';
        childprocess.stdout!.on('data', (data: any) => {
            stdout += data.toString();
        });

        childprocess.stdout!.on('close', () => {
            resolve(stdout);
        });
    });
}

async function ensureWeHaveDotnet() {
    let dotnetVersion = '';

    try {
        dotnetVersion = await shellExec('dotnet', ['--version'], '') ?? '';
    }
    catch (e) {
        console.error(`Failed to get dotnet version: ${e}`);
    }

    if (!dotnetVersion) {
        throw new Error('Failed to get dotnet version. Make sure dotnet SDK is installed and in vscode PATH');
    }

    const dotnetVersionParts = dotnetVersion.split('.');
    const majorVersion = parseInt(dotnetVersionParts[0]);

    if (isNaN(majorVersion)) {
        throw new Error(`Failed to parse dotnet version: ${dotnetVersion}`);
    }

    if (majorVersion < 10) {
        throw new Error(`csharp-ls requires dotnet SDK version 10.0 or higher. Current version is ${dotnetVersion}`);
    }
}

async function resolveCsharpLsBinaryPath(extensionPath: string,) {
    const devCsharpLsBinaryPath = workspace.getConfiguration('csharp-ls').get('csharp-ls-executable') as string;

    if (devCsharpLsBinaryPath) {
        return devCsharpLsBinaryPath;
    }

    const csharpLsRootPath = path.resolve(extensionPath, `.csharp-ls.${csharpLsVersion}`);

    if (!existsSync(csharpLsRootPath)) {
        await mkdir(csharpLsRootPath, { recursive: true });
    }

    const csharpLsBinaryPath = path.resolve(csharpLsRootPath, 'csharp-ls');

    if (!existsSync(csharpLsBinaryPath)) {

        const installArgs = [
            'tool',
            'install',
            'csharp-ls',
            '--tool-path', csharpLsRootPath,
            '--version', csharpLsVersion,
        ];

        try {
            await shellExec('dotnet', installArgs, csharpLsRootPath);
        }
        catch (e) {
            window.showErrorMessage(`Failed to install csharp-ls: ${e}`);
            throw new Error('Failed to install csharp-ls');
        }
    }

    return csharpLsBinaryPath;
}

function registerTextDocumentContentProviders() {
    interface CSharpMetadataResponse {
        projectName: string;
        assemblyName: string;
        symbolName: string;
        source: string;
    }

    const csharpMetadataProvider = new (class implements TextDocumentContentProvider {
        async provideTextDocumentContent(uri: Uri): Promise<string> {
            const request = {
                textDocument: {
                    uri: uri.toString(true) // skipEncoding=true
                }
            };

            const response = await client?.sendRequest<CSharpMetadataResponse>('csharp/metadata', request);

            return response?.source ?? '';
        }
      })();

    workspace.registerTextDocumentContentProvider('csharp', csharpMetadataProvider);

    workspace.onDidOpenTextDocument(async (document) => {
        if (document.uri.scheme === 'csharp') {
            await languages.setTextDocumentLanguage(document, 'csharp');
        }
    });
}
