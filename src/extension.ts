import * as vscode from 'vscode';
import { workspace, window } from 'vscode'; // Add this line
import matter from 'gray-matter';
import path from 'path';

/* Global variables */

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "markdown-searcher" is now active!');
  context.subscriptions.push(vscode.commands.registerCommand('markdown-searcher.search', commandHandler));
}

/* tag-based search for markdown files. */
async function searchFilesByTags(tags: string[]) {
  const files = await workspace.findFiles('**/*.md');
  const matchedFiles = [];

  for (const file of files) {
    const document = await workspace.openTextDocument(file);
    const { data } = matter(document.getText());
    const fileTags = data.tags;

		let dir = "";
		if (workspace.workspaceFolders !== undefined) {
			dir = workspace.workspaceFolders[0].uri.path ;
		}
    if (fileTags && tags.every(tag => fileTags.includes(tag))) {
      matchedFiles.push(path.relative(dir, file.path));
    }
  }

  return matchedFiles;
}

/* tag-based search for markdown files. */
async function commandHandler() {
	const input = await window.showInputBox();
	const tags = input?.split(' ');

	/* Displaying a list of files in a quick pick */
	if (!tags) {
		return;
	}
	const paths = await searchFilesByTags(tags);
	if (!paths.length) {
		window.showInformationMessage('No files found');
		return;
	}
	const selected = await window.showQuickPick(paths);

	/* Open the selected file */
	if (selected) {
		let dir = "";
		if (workspace.workspaceFolders !== undefined) {
			dir = workspace.workspaceFolders[0].uri.path ;
		}
		const document = await workspace.openTextDocument(path.join(dir, selected));
		window.showTextDocument(document);
	}
};

// This method is called when your extension is deactivated
export function deactivate() {}
