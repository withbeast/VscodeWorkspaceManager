import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

class Workspace extends vscode.TreeItem {
  constructor(public name: string,public paths:string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(name, collapsibleState);
  }
  iconPath = {
    light: path.join(__filename, '..', '..', 'assets', 'item_light.svg'),
    dark: path.join(__filename, '..', '..', 'assets', 'item_dark.svg')
  };
}


export class WorkspaceProvider implements vscode.TreeDataProvider<Workspace> {
    path:string=path.join(__filename, '..', '..', 'assets', 'cache.json');
    private _onDidChangeTreeData: vscode.EventEmitter<Workspace | undefined | null | void> = new vscode.EventEmitter<Workspace | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Workspace | undefined | null | void> = this._onDidChangeTreeData.event;

  
  constructor(private workspaceRoot: string) { }

  getTreeItem(element: Workspace): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Workspace): Thenable<Workspace[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
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
  private parseJson():Workspace[]{
    const data = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
    let workspaces=data['workspaces'];
    let arr=[];
    for (let i = 0; i < workspaces.length; i++) {
        const name = workspaces[i].name;
        const paths = workspaces[i].path;
        arr.push(new Workspace(name,paths,vscode.TreeItemCollapsibleState.None));
    }
    return arr;
  }
}


