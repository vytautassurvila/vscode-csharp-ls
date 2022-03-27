import {
	commands,
	ExtensionContext,
} from "vscode";
import { selectSolutionCommand } from "./commands/selectSolution";
import { autostartCSharpLsServer, stopCSharpLsServer } from "./cSharpLsServer";

export async function activate(context: ExtensionContext) {
	let disposable = commands
		.registerCommand('vscode-csharp-ls.selectSolution', () => selectSolutionCommand(context));

	context.subscriptions.push(disposable);

	await autostartCSharpLsServer(context);
}

export async function deactivate(): Promise<void> {
	await stopCSharpLsServer();
}
