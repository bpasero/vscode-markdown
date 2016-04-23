'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    
    let registration = vscode.workspace.registerTextDocumentContentProvider('markdown', {
        provideTextDocumentContent(uri) {
            console.log("hit");
            
            return `content of URI <b>${uri.toString()}</b>`;
        }
    });

    let disposable = vscode.commands.registerCommand('extension.previewMarkdown', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }
        
        let markdownPreviewUri = vscode.Uri.parse(`markdown://${activeEditor.document.uri.fsPath}`);

        return vscode.commands.executeCommand('vscode.previewHtml', markdownPreviewUri).then(success => {
           console.log("SUCCESS")
        });
    });

    context.subscriptions.push(disposable, registration);
}