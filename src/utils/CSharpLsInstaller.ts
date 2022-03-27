import { existsSync } from 'fs';
import * as path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { Executable } from 'vscode-languageclient/node';
import { ChildProcess, spawn } from 'child_process';

export async function installCSharpLsIfNotAlready(
    extensionPath: string,
    version: string
): Promise<Executable> {
    const csharpLsRootPath = path.resolve(extensionPath, `.csharp-ls.${version}`);
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
                    "version": "${version}",
                    "commands": [
                    "csharp-ls"
                    ]
                }
                }
            }`);

        await shellExec('dotnet', ['tool', 'restore'], csharpLsRootPath);
    }

    return {
        command: 'dotnet tool run csharp-ls',
        options: {
            cwd: csharpLsRootPath,
            shell: true,
        },
    };
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
