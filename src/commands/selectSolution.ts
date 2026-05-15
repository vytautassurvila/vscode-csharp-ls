import { ExtensionContext, window } from 'vscode';
import { changeCSharpLsSolution, getTargetSolutionPaths } from '../cSharpLsServer';

export async function selectSolutionCommand(context: ExtensionContext) {
    const selection = await window.showQuickPick(await getTargetSolutionPaths(), { canPickMany: false });

    if (selection === undefined) {
        return;
    }

    await context.workspaceState.update('lastSolutionPathOrFolder', selection);

    await changeCSharpLsSolution(selection);
}
