'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const hljs = require('highlight.js');
const md = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
            } catch (error) { }
        }

        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
});

export function activate(context: vscode.ExtensionContext) {
    let registration = vscode.workspace.registerTextDocumentContentProvider('markdown', {
        provideTextDocumentContent(uri) {
            return new Promise((approve, reject) => {
                fs.readFile(uri.fsPath, (error, buffer) => {
                    if (error) {
                        return reject(error);
                    }
                    
                    const res = md.render(buffer.toString());

                    const baseCss = `<link rel="stylesheet" type="text/css" href="${path.join(__dirname, '..', '..', 'media', 'markdown.css')}" >`;
                    const codeCss = `<link rel="stylesheet" type="text/css" href="${path.join(__dirname, '..', '..', 'media', 'tomorrow.css')}" >`;

                    approve(baseCss + codeCss + res);
                });
            });
        }
    });

    let d1 = vscode.commands.registerCommand('extension.previewMarkdown', () => openPreview());
    let d2 = vscode.commands.registerCommand('extension.previewMarkdownSide', () => openPreview(true));

    context.subscriptions.push(d1, d2, registration);
}

function openPreview(sideBySide?: boolean): void {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    let markdownPreviewUri = vscode.Uri.parse(`markdown://${activeEditor.document.uri.fsPath}`);

    vscode.commands.executeCommand('vscode.previewHtml', markdownPreviewUri, getViewColumn(sideBySide));
}

function getViewColumn(sideBySide): vscode.ViewColumn {
    const active = vscode.window.activeTextEditor;
    if (!active) {
        return vscode.ViewColumn.One;
    }

    if (!sideBySide) {
        return active.viewColumn;
    }

    switch (active.viewColumn) {
        case vscode.ViewColumn.One:
            return vscode.ViewColumn.Two;
        case vscode.ViewColumn.Two:
            return vscode.ViewColumn.Three;
    }

    return active.viewColumn;
}