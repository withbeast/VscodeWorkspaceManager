import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as JSON5 from 'json5';

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
    dataPath: string = path.join(__filename, '..', '..', 'assets', 'cache.json');
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
        const work = JSON5.parse(fs.readFileSync(this.workspaceRoot, 'utf-8'));
        let workspaceDir=path.dirname(this.workspaceRoot);
        let arr: any[] = [];
        work['wmFolders'].forEach((project: any) => {
            arr.push(new Project(project['name'], project['path'], project['active'], vscode.TreeItemCollapsibleState.None));
        });
        return arr;
    }
}


