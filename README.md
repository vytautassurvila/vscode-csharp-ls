# vscode-csharp-ls

Visual Studio Code C# LSP client for [csharp-language-server](https://github.com/razzmatazz/csharp-language-server)

## Features

See [csharp-language-server Features](https://github.com/razzmatazz/csharp-language-server#features)

## Requirements

This extension requires that the .NET 6 SDK be installed and on path for Visual Studio Code.

At the moment extension can be installed only by building it from source `npm install &&  npm run build` and then _Install from VSIX..._

## Extension Settings

This extension contributes the following settings:

* `csharp-ls.logLevel`: verbosity level for csharp-ls server
* `csharp-ls.trace.server`: traces the communication between VS Code and the language server.
* `csharp-ls.dev.csharp-ls-executable`: Executable path to local csharp-ls. To be used for testing not released csharp-ls version. Example: `dotnet /home/user/.../Debug/net7.0/CSharpLanguageServer.dll`
