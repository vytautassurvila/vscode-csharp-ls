import { existsSync } from 'fs';
import * as path from 'path';
import { mkdir } from 'fs/promises';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { ChildProcess, spawn } from 'child_process';
import { ExtensionContext, workspace, window, commands } from 'vscode';
import { csharpLsVersion } from './constants/csharpLsVersion';

let client: LanguageClient | undefined = undefined;

export async function startCSharpLsServer(
    extensionPath: string,
    solutionPath: string,
): Promise<void> {
    await stopCSharpLsServer();

    const csharpLsBinaryPath = await resolveCsharpLsBinaryPath(extensionPath);

    const slnWorkspaceFolder = workspace.workspaceFolders?.find(f => solutionPath.startsWith(f.uri.fsPath));
    const rootPath = slnWorkspaceFolder?.uri.fsPath ?? workspace.rootPath ?? '';
    const relativeSolutionPath = solutionPath.replace(rootPath, '').replace(/^[\/\\]/, '');

    const csharpLsExecutable = {
        command: `${csharpLsBinaryPath} --solution ${relativeSolutionPath}`,
        options: {
            cwd: rootPath,
            shell: true,
        },
    };

    const serverOptions: ServerOptions = {
        run: csharpLsExecutable,
        debug: csharpLsExecutable,
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'csharp' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/.{cs,csproj}')
        }
    };

    client = new LanguageClient(
        'csharp-ls',
        'CSharp Language Server',
        serverOptions,
        clientOptions
    );

    client.start();
}

export async function stopCSharpLsServer(): Promise<void> {
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
            commands.executeCommand('vscode-csharp-ls.selectSolution');
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
            return resolve(undefined);
        }

        childprocess.stderr!.on('data', function (error: any) {
            console.error('spawn', command, args, cwd, error.toString());
            resolve(undefined);
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

async function resolveCsharpLsBinaryPath(extensionPath: string,) {
    const devCsharpLsBinaryPath = workspace.getConfiguration('csharp-ls').get('dev.csharp-ls-executable') as string;

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

        await shellExec('dotnet', installArgs, csharpLsRootPath);
    }

    return csharpLsBinaryPath;
}
