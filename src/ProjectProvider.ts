import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class Project extends vscode.TreeItem {
    constructor(public name: string, public paths: string, public active: boolean, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(name, collapsibleState);
        this.description = paths;
        this.tooltip = name + "\n" + paths;
        if (active) {
            this.iconPath = {
                light: path.join(__filename, '..', '..', 'assets', 'check_light.svg'),
                dark: path.join(__filename, '..', '..', 'assets', 'check_dark.svg')
            };
        } else {
            this.iconPath = {
                light: path.join(__filename, '..', '..', 'assets', 'uncheck_light.svg'),
                dark: path.join(__filename, '..', '..', 'assets', 'uncheck_dark.svg')
            };
        }
    }
}


export class ProjectProvider implements vscode.TreeDataProvider<Project> {
    path: string = path.join(__filename, '..', '..', 'assets', 'cache.json');
    private _onDidChangeTreeData: vscode.EventEmitter<Project | undefined | null | void> = new vscode.EventEmitter<Project | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<Project | undefined | null | void> = this._onDidChangeTreeData.event;


    constructor(private workspaceRoot: string) { }

    getTreeItem(element: Project): vscode.TreeItem {
        if (element.active) {
            element.contextValue = "projectActive";
        } else {
            element.contextValue = "project";
        }
        return element;
    }

    getChildren(element?: Project): Thenable<Project[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No project in empty workspace');
            return Promise.resolve([]);
        }

        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.parseJson());
        }
    }
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    private parseJson(): Project[] {
        const data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
        const currentPath=vscode.workspace.workspaceFile?.path;
        let arr: any[] = [];
        data['workspaces'].forEach((element:any) => {
            if(element['path']===currentPath){
                element['folders'].forEach((folder:any) => {               
                    arr.push(new Project(folder['name'], folder['path'], folder['active'], vscode.TreeItemCollapsibleState.None));
                });
            }
        });
        return arr;
    }
}


