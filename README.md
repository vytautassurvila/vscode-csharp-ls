# vscode-csharp-ls

Visual Studio Code C# LSP client for [csharp-language-server](https://github.com/razzmatazz/csharp-language-server)

## Features

TODO:
## Requirements

This extension requires that the .NET 6 SDK be installed and on path for Visual Studio Code
## Extension Settings

This extension contributes the following settings:

* `csharp-ls.logLevel`: verbosity level for csharp-ls server
* `csharp-ls.trace.server`: traces the communication between VS Code and the language server.

## Known Issues

* `textDocument/codeAction` responses with `"kind": "source.organizeImports"` for some reason are ingored by vscode
* vscode default autocomplete quite often kicks in before vscode-csharp-ls autocomplete. One should close it and request autocomplete again
* decomplication is missing. Should be implemented in similar manner https://github.com/razzmatazz/csharp-language-server/issues/21
