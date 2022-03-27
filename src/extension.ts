import {
	commands,
	ExtensionContext,
	window,
	workspace,
} from "vscode";

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';

import { installCSharpLsIfNotAlready } from "./utils/CSharpLsInstaller";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
	const csharpLsExecutable = await installCSharpLsIfNotAlready(context.extensionPath, '0.3.0');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = commands.registerCommand('vscode-csharp-ls.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		window.showInformationMessage('Hello World from vscode-csharp-ls!');
	});

	context.subscriptions.push(disposable);


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

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
