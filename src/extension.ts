'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const hljs = require('highlight.js'); // https://highlightjs.org/
const md = require('markdown-it')({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

export function activate(context: vscode.ExtensionContext) {
    let registration = vscode.workspace.registerTextDocumentContentProvider('markdown', {
        provideTextDocumentContent(uri) {
            let res = md.render(fs.readFileSync(uri.fsPath).toString());

            let baseCss = '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '..', '..', 'media', 'markdown.css')) + '</style>';
            let codeCss = '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '..', '..', 'media', 'tomorrow.css')) + '</style>';
            res = baseCss + codeCss + res;

            return res;
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

    vscode.commands.executeCommand('vscode.previewHtml', markdownPreviewUri, getViewColumn(sideBySide)).then(success => {
        console.log("SUCCESS");
    });
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