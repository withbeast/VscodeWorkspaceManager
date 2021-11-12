// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { NodeDependenciesProvider } from './tree';
import { WorkspaceProvider } from './WorkspaceProvider';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let dataPath = path.join(__filename, '..', '..', 'assets', 'cache.json');
	let paths = "";
	if (vscode.workspace.workspaceFolders)
		paths = vscode.workspace.workspaceFolders[0].uri.path;
	console.log('Congratulations, your extension "workspace-manager" is now active!');
	// let uri = vscode.Uri.file('/home/withbeast/withbeast/C#Projects/workspace/c#.code-workspace');
	// vscode.commands.executeCommand('vscode.openFolder', uri).then((value)=>{
	// 	console.log(value);
	// });
	const provider = new WorkspaceProvider(paths);
	vscode.window.registerTreeDataProvider('WorkspaceList', provider);
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.refreshWorkspace', () => {
		provider.refresh();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.activateWorkspace', () => {
		vscode.window.showInformationMessage('Hello World from vscode-workspace-manager!');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.deleteWorkspace', () => {
		vscode.window.showInformationMessage('Hello World from vscode-workspace-manager!');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.addWorkspace', () => {

		vscode.window.showInputBox().then((value: string | undefined) => {
			if (value) {
				let name: string = value.slice(value.lastIndexOf("/") + 1, value.indexOf("."))+"工作区";
				let all: string = value;
				let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
				data['workspaces'].push({ name: name, path: all });
				fs.writeFileSync(path.join(__filename, '..', '..', 'assets', 'cache.json'), JSON.stringify(data), 'utf-8');
				provider.refresh();
			}
		});
		// vscode.window.showWorkspaceFolderPick().then((value)=>{
		// 	console.log(value);
		// });

	}));


	// vscode.window.createTreeView('WorkspaceList', {
	// 	treeDataProvider: new WorkspaceProvider(paths)
	// });



}

// this method is called when your extension is deactivated
export function deactivate() { }
