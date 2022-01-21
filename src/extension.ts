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

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "vscode-csharp-ls" is now active!');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = commands.registerCommand('vscode-csharp-ls.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		window.showInformationMessage('Hello World from vscode-csharp-ls!');
	});

	context.subscriptions.push(disposable);





	const serverModule = 'csharp-ls';
		//context.asAbsolutePath(path.join('server', 'out', 'server.js'));

	const serverOptions: ServerOptions = {
		run: { command: serverModule },
		debug: { command: serverModule },
	};

	const clientOptions: LanguageClientOptions = {
		// if second selecter defined then it fully stops working. Need to figure how to enable it for razor
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
