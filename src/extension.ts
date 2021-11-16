// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { WorkspaceProvider, Workspace } from './WorkspaceProvider';
import { Project, ProjectProvider } from './ProjectProvider';
import * as path from 'path';
import * as fs from 'fs';
import * as JSON5 from 'json5';

function init(dataPath: string, workPath: string) {
	const data = JSON5.parse(fs.readFileSync(dataPath, 'utf-8'));
	const work = JSON5.parse(fs.readFileSync(workPath, 'utf-8'));
	data['workspaces'].forEach((item: any) => {
		if (!("name" in item)) {
			item['name'] = path.basename(item.path, '.code-workspace') + " (工作区)";
		}
		if (item['path'] === workPath) {
			item['active'] = true;
		} else {
			item['active'] = false;
		}
	});
	if(!("wmFolders" in work)){
		work['wmFolders']=[];
	}
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
	fs.writeFileSync(workPath, JSON.stringify(work, null, 4), 'utf-8');
}
class ProjectItem implements vscode.QuickPickItem {
	constructor(public label: string, public description: string,public active:boolean) { }
}
class WorkspaceItem implements vscode.QuickPickItem {
	constructor(public label: string, public description: string, public isActive: boolean) { }
}
export function activate(context: vscode.ExtensionContext) {
	let dataPath = path.join(__filename, '..', '..', 'assets', 'cache.json');
	let workPath = vscode.workspace.workspaceFile?.fsPath;
	let workName = vscode.workspace.name;
	if (workPath && workName) {
		init(dataPath, workPath);
		const workspaceProvider = new WorkspaceProvider(workPath);
		const projectProvider = new ProjectProvider(workPath);
		vscode.window.registerTreeDataProvider('WorkspaceList', workspaceProvider);
		vscode.window.registerTreeDataProvider('ProjectList', projectProvider);
		/**
		 * 测试方法
		 */
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.test', () => {
			console.log("test");
		}));
		/**
		 * 工作区相关
		 */
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.addWorkspace', () => {
			vscode.window.showOpenDialog(
				{
					canSelectFiles: true,
					canSelectMany: false,
					filters: {
						'worspace': ['code-workspace']
					}
				}).then((files: vscode.Uri[] | undefined) => {
					if (files) {
						let workspacePath = files[0].fsPath;
						let workspaceName = path.basename(workspacePath, '.code-workspace') + " (工作区)";
						if (workspacePath !== workPath) {
							let data = JSON5.parse(fs.readFileSync(dataPath, 'utf-8'));
							data['workspaces'].push({ name: workspaceName, path: workspacePath, active: false });
							fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
							workspaceProvider.refresh();
						} else {
							vscode.window.showInformationMessage('工作区已在目录中！');
						}
					}
				});
		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.refreshWorkspace', () => {
			workspaceProvider.refresh();
		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.deleteWorkspace', () => {
			let data = JSON5.parse(fs.readFileSync(dataPath, 'utf-8'));
			let dataArr: WorkspaceItem[] = [];
			data['workspaces'].forEach((item: any) => {
				dataArr.push(new WorkspaceItem(item['name'], item['path'], item['active']));
			});
			vscode.window.showQuickPick(dataArr).then((tar: vscode.QuickPickItem | undefined) => {
				let newArr: any[] = [];
				data['workspaces'].forEach((item: any) => {
					if (tar?.description !== item['path']) {
						newArr.push(item);
					}
				});
				data['workspaces'] = newArr;
				fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
				workspaceProvider.refresh();
			});

		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.currentWorkspace', () => {
			let workspaceDir = path.dirname(workPath as string);
			let data = JSON5.parse(fs.readFileSync(dataPath, 'utf-8'));
			let exist = false;
			data['workspaces'].forEach((element: any) => {
				if (element['path'] === workPath) {
					vscode.window.showInformationMessage("工作区已在目录中！");
					exist = true;
				}
			});
			if (!exist) {
				data['workspaces'].push({ name: workName, path: workPath, active: true });
				fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
				workspaceProvider.refresh();
			}
		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.activateWorkspace', (node: Workspace) => {
			if (node.paths === workPath) {
				vscode.window.showInformationMessage("工作区已经处于激活状态");
			} else {
				let uri = vscode.Uri.file(node.paths);
				vscode.commands.executeCommand('vscode.openFolder', uri);
				vscode.window.showInformationMessage("正在打开工作区：" + node.name);
			}
		}));
		/**
		 * 项目相关
		 */
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.switchProject', (node: Project) => {
			let work = JSON5.parse(fs.readFileSync(workPath as string, 'utf-8'));
			let workspaceDir=path.dirname(workPath as string);
			work['wmFolders'].forEach((project: any) => {
				if (project['path'] === node.paths) {
					if(project['active']){
						project['active']=false;
						node.active=false;
					}else{
						project['active']=true;
						node.active=true;
					}
				}
			});
			if(node.active){
				work['folders'].push({name:node.name,path:node.paths});
			}else{
				let newArr:any[]=[];
				work['folders'].forEach((project:any)=>{
					if(project['path']!==node.paths){
						newArr.push(project);
					}
				});
				work['folders']=newArr;
			}
			fs.writeFileSync(workPath as string, JSON.stringify(work, null, 4), 'utf-8');
			projectProvider.refresh();
		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.deleteProject', () => {
			let work = JSON5.parse(fs.readFileSync(workPath as string, 'utf-8'));
			let workspaceDir=path.dirname(workPath as string);
			let dataArr: vscode.QuickPickItem[] = [];
			work['wmFolders'].forEach((project: any) => {
				dataArr.push(new ProjectItem(
					project['name'],
					project['path'],
					project['active']
				));
			});
			vscode.window.showQuickPick(dataArr).then((tar: vscode.QuickPickItem | undefined) => {
				let newArr: any[] = [];
				work['wmFolders'].forEach((project: any) => {
					if (project['path'] !== tar?.description) {
						newArr.push(project);
					}
				});
				let newArr2: any[] = [];
				work['folders'].forEach((project: any) => {
					if (project['path'] !== tar?.description) {
						newArr2.push(project);
					}
				});
				work['wmFolders'] = newArr;
				work['folders'] = newArr2;
				fs.writeFileSync(workPath as string, JSON.stringify(work, null, 4), 'utf-8');
				projectProvider.refresh();
			});

		}));

		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.refreshProject', () => {
			let work = JSON5.parse(fs.readFileSync(workPath as string, 'utf-8'));
			let projectList:string[]=[];
			work['wmFolders'].forEach((project:any)=>{
				projectList.push(project['path']);
			});
			work['folders'].forEach((project:any)=>{
				if(!projectList.includes(project['path'])){
					let projectName:string=path.basename(path.isAbsolute(project['path']) ? project['path'] : path.resolve(path.dirname(workPath as string), project['path']));
					work['wmFolders'].push({name:projectName,path:project['path'],active:true});
				}
			});
			fs.writeFileSync(workPath as string, JSON.stringify(work, null, 4), 'utf-8');
			projectProvider.refresh();
		}));
		context.subscriptions.push(vscode.commands.registerCommand('WorkspaceManager.addProject', () => {
			vscode.window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false
			}).then((folder: vscode.Uri[] | undefined) => {
				if (folder) {
					let work = JSON5.parse(fs.readFileSync(workPath as string, 'utf-8'));
					let projectName = path.basename(folder[0].fsPath);
					let projectPath = path.relative(path.dirname(workPath as string), folder[0].fsPath);
					projectPath = projectPath === "" ? "." : projectPath;
					let exist = false;
					work['wmFolders'].forEach((project: any) => {
						if (project['path'] === projectPath) {
							exist = true;
						}
					});
					if (!exist) {
						work['wmFolders'].push({ path: projectPath, name: projectName,active:true });
						work['folders'].push({ path: projectPath, name: projectName });
						fs.writeFileSync(workPath as string, JSON.stringify(work, null, 4), 'utf-8');
						projectProvider.refresh();
					} else { vscode.window.showInformationMessage('项目已经在工作区中！'); }
				}
			});
		}));
	} else { vscode.window.showInformationMessage('没有打开任何工作区！'); }
}

export function deactivate() { }
