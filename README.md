# vscode-csharp-ls

Visual Studio Code C# LSP client for [csharp-language-server](https://github.com/razzmatazz/csharp-language-server)

## Features

See [csharp-language-server Features](https://github.com/razzmatazz/csharp-language-server#features)

## Requirements

This extension requires that the .NET 6 SDK be installed and on path for Visual Studio Code

## Extension Settings

This extension contributes the following settings:

* `csharp-ls.logLevel`: verbosity level for csharp-ls server
* `csharp-ls.trace.server`: traces the communication between VS Code and the language server.
* `csharp-ls.dev.local-nupkg-dir`: local nupgk directory for csharp-ls. To be used for testing not yet released csharp-ls version

## Known Issues

* decomplication is missing. Could be implemented in similar manner https://github.com/razzmatazz/csharp-language-server/issues/21
