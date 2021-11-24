import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class Workspace extends vscode.TreeItem {
  constructor(public name: string,public paths:string,public active:boolean, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(name, collapsibleState);
    this.description=paths;
    this.tooltip=name+"\n"+paths;
    if(active){
      this.iconPath={
        light: path.join(__filename, '..', '..', 'assets', 'item_light.svg'),
        dark: path.join(__filename, '..', '..', 'assets', 'item_dark.svg')
      };
    }
  }
}


export class WorkspaceProvider implements vscode.TreeDataProvider<Workspace> {
    path:string=path.join(__filename, '..', '..', 'assets', 'cache.json');
    private _onDidChangeTreeData: vscode.EventEmitter<Workspace | undefined | null | void> = new vscode.EventEmitter<Workspace | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Workspace | undefined | null | void> = this._onDidChangeTreeData.event;

  
  constructor() { }

  getTreeItem(element: Workspace): vscode.TreeItem {
    if(element.active){
      element.contextValue="workspaceActive";
    }else{
      element.contextValue="workspace";
    }
    return element;
  }

  getChildren(element?: Workspace): Thenable<Workspace[]> {


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
        const active= workspaces[i].active;
        arr.push(new Workspace(name,paths,active,vscode.TreeItemCollapsibleState.None));
    }
    return arr;
  }
}


