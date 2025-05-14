# csharp-ls

Visual Studio Code C# LSP client for [csharp-language-server](https://github.com/razzmatazz/csharp-language-server).

## Why?

Visual Studio Code already has a great extension for [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp). It works very well in most cases and probably you should try it first. But on big monorepos it takes way too long to initialize or to respond to any commands. In that case csharp-ls comes to the rescue.

## Features

See [csharp-language-server Features](https://github.com/razzmatazz/csharp-language-server#features)

## Requirements

This extension requires that the .NET 9 (or greater) SDK be installed and on path for Visual Studio Code.

## Usage

If opened folder contains single Solution (.sln) file the language server will be launched automatically. In case you have more than one solution files then on first launch you should see prompt asking which solution file to use. Later solution can be changed with command `csharp-ls: Select solution or project`.

## Extension Settings

This extension contributes the following settings:

* `csharp-ls.trace.server`: traces the communication between VS Code and the language server.
* `csharp-ls.csharp-ls-executable`: Executable path to local csharp-ls. To be used for testing not released csharp-ls version (value: `dotnet /home/user/.../Debug/net7.0/CSharpLanguageServer.dll`). It also can be used for globally installed server via `dotnet tool install --global csharp-ls` (value: `csharp-ls`).
