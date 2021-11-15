// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { NodeDependenciesProvider } from './tree';
import { WorkspaceProvider, Workspace } from './WorkspaceProvider';
import { Project, ProjectProvider } from './ProjectProvider';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function init(dataPath: string) {
	const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
	let currentPath = vscode.workspace.workspaceFile?.path;
	let workspaces = data['workspaces'];
	workspaces.forEach((item: any, index: number) => {
		if (item['path'] === currentPath) {
			item['active'] = true;
		} else {
			item['active'] = false;
		}
	});
	data['workspaces'] = workspaces;
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
}
export function activate(context: vscode.ExtensionContext) {

	let dataPath = path.join(__filename, '..', '..', 'assets', 'cache.json');
	let paths = "";
	if (vscode.workspace.workspaceFolders) { paths = vscode.workspace.workspaceFolders[0].uri.path; }
	console.log('Congratulations, your extension "workspace-manager" is now active!');
	init(dataPath);
	const workspaceProvider = new WorkspaceProvider(paths);
	const projectProvider = new ProjectProvider(paths);
	vscode.window.registerTreeDataProvider('WorkspaceList', workspaceProvider);
	vscode.window.registerTreeDataProvider('ProjectList', projectProvider);
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.test', () => {
		// let testPath = path.join(__filename, '..', '..', 'assets', 'test.json');
		// const data = JSON.parse(fs.readFileSync(testPath, 'utf-8'));
		// let test = data['test'];
		// test.forEach((item: any, index: number) => {
		// 	if(item['name']==="king"){
		// 		item['msg']="well";
		// 	}
		// });
		// data['test'] = test;
		// fs.writeFileSync(testPath, JSON.stringify(data,null,4), 'utf-8');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.refreshWorkspace', () => {
		workspaceProvider.refresh();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.activateWorkspace', (node: Workspace) => {
		let currentName = vscode.workspace.name;
		let currentPath = vscode.workspace.workspaceFile?.path;
		if (node.paths === currentPath) {
			vscode.window.showInformationMessage(currentName + "已经打开");
		} else {
			let uri = vscode.Uri.file(node.paths);
			vscode.commands.executeCommand('vscode.openFolder', uri);
			vscode.window.showInformationMessage(node.name + "正在打开");
		}

	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.deleteWorkspace', () => {
		let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
		let workspaceArr: any[] = data['workspaces'];
		let dataArr: any[] = [];
		let newArr: any[] = [];
		workspaceArr.forEach((item: any, index: number) => {
			dataArr.push((index + 1) + ":" + item['name']);
		});
		vscode.window.showQuickPick(dataArr).then((tar: string) => {
			let i: number = Number(tar.split(":")[0]) - 1;
			let newArr: any[] = [];
			workspaceArr.forEach((item: any, index: number) => {
				if (index !== i) {
					newArr.push(item);
				}
			});
			data['workspaces'] = newArr;
			fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
			workspaceProvider.refresh();
			vscode.window.showInformationMessage('已经删除' + vscode.workspace.name);
		});

	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.addWorkspace', () => {
		let currentName = vscode.workspace.name;
		let currentPath = vscode.workspace.workspaceFile?.path;
		let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
		let workspaceArr = data['workspaces'];
		workspaceArr.forEach((element: any) => {
			if (element['path'] === currentPath) {
				vscode.window.showInformationMessage(vscode.workspace.name + "已经存在");
				return;
			}
		});
		let foldersArr: any[] = [];
		vscode.workspace.workspaceFolders?.forEach((folders: vscode.WorkspaceFolder) => {
			let name = folders.name;
			let path = folders.uri.path;
			console.log(name, path);
			foldersArr.push({ name: name, path: path, active: true });
		});
		data['workspaces'].push({ name: currentName, path: currentPath, active: true, folders: foldersArr });
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
		workspaceProvider.refresh();

		vscode.window.showInformationMessage('已经添加' + vscode.workspace.name);

	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.switchProject', (node: Project) => {
		let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
		let workspaceArr = data['workspaces'];
		workspaceArr.forEach((element: any) => {
			if (element['path'] === vscode.workspace.workspaceFile?.path) {
				element['folders'].forEach((folder: any) => {
					if (folder['path'] === node.paths) {
						folder['active'] = !folder['active'];
					}
				});
			}
		});
		data['workspaces'] = workspaceArr;
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
		projectProvider.refresh();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.deleteProject', () => {
		let data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
		let workspaceArr = data['workspaces'];

		workspaceArr.forEach((element: any) => {
			if (element['path'] === vscode.workspace.workspaceFile?.path) {
				let dataArr: any[] = [];
				element['folders'].forEach((folder: any, index: number) => {
					dataArr.push((index + 1) + ":" + folder['name']);
				});
				vscode.window.showQuickPick(dataArr).then((tar: string) => {
					let i: number = Number(tar.split(":")[0]) - 1;
					let newArr: any[] = [];
					element['folders'].forEach((folder: any,pos:number) => {
						if (i!==pos) {
							newArr.push(folder);
						}
					});
					
					element['folders']=newArr;
					fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
					projectProvider.refresh();
				});
			}
		});
		
	}));

	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.refreshProject', () => {
		projectProvider.refresh();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.addProject', () => {

	}));

	// vscode.window.createTreeView('WorkspaceList', {
	// 	treeDataProvider: new WorkspaceProvider(paths)
	// });



}

// this method is called when your extension is deactivated
export function deactivate() { }
