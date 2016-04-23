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
            
            let baseCss = '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '..', '..', 'markdown.css')) + '</style>';
            let codeCss = '<style type="text/css">' + fs.readFileSync(path.join(__dirname, '..', '..', 'tomorrow.css')) + '</style>';
            res = baseCss + codeCss + res;
            
            return res;
        }
    });

    let disposable = vscode.commands.registerCommand('extension.previewMarkdown', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        let markdownPreviewUri = vscode.Uri.parse(`markdown://${activeEditor.document.uri.fsPath}`);

        return vscode.commands.executeCommand('vscode.previewHtml', markdownPreviewUri).then(success => {
            console.log("SUCCESS");
        });
    });

    context.subscriptions.push(disposable, registration);
}