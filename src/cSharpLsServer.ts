import { existsSync } from 'fs';
import * as path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { ChildProcess, spawn } from 'child_process';
import { ExtensionContext, workspace } from 'vscode';
import { csharpLsVersion } from './constants/csharpLsVersion';

let client: LanguageClient | undefined = undefined;

export async function startCSharpLsServer(
    extensionPath: string,
    solutionPath: string,
): Promise<void> {
    await stopCSharpLsServer();

    const csharpLsRootPath = path.resolve(extensionPath, `.csharp-ls.${csharpLsVersion}`);
    const toolsConfigPath = path.resolve(csharpLsRootPath, '.config/dotnet-tools.json');

    if (!existsSync(toolsConfigPath)) {

        const toolsDirectory = path.dirname(toolsConfigPath);

        if (!existsSync(toolsDirectory)) {
            await mkdir(toolsDirectory, { recursive: true });
        }

        await writeFile(toolsConfigPath,
            `{
                "version": 1,
                "isRoot": true,
                "tools": {
                    "csharp-ls": {
                        "version": "${csharpLsVersion}",
                        "commands": [
                        "csharp-ls"
                        ]
                    }
                }
            }`);

        await shellExec('dotnet', ['tool', 'restore'], csharpLsRootPath);
    }

    const csharpLsExecutable = {
        command: `dotnet tool run csharp-ls -- --solution "${solutionPath}"`,
        options: {
            cwd: csharpLsRootPath,
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

    return solutionFiles.map(f => f.fsPath);
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
}

function shellExec(command: string, args: string[], cwd: string): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve, reject) => {
        let childprocess: ChildProcess;
        try {
            childprocess = spawn(command, args, { cwd });
        }
        catch (e) {
            return resolve(undefined);
        }

        childprocess.on('error', function (error: any) {
            console.error('shellExec', command, args, cwd, error);
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
