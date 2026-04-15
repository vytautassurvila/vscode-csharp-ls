# csharp-ls

Visual Studio Code C# LSP client for [csharp-language-server](https://github.com/razzmatazz/csharp-language-server).

## Why?

Visual Studio Code already has a great extension for [C#](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp). It works very well in most cases and probably you should try it first. But on big monorepos it takes way too long to initialize or to respond to any commands. In that case csharp-ls comes to the rescue.

## Features

See [csharp-language-server Features](https://github.com/razzmatazz/csharp-language-server/blob/main/FEATURES.md)

## Requirements

This extension requires that the .NET 10 (or greater) SDK be installed and on path for Visual Studio Code.

## Usage

If opened folder contains single Solution (.sln) file the language server will be launched automatically. In case you have more than one solution files then on first launch you should see prompt asking which solution file to use. Later solution can be changed with command `csharp-ls: Select solution or project`.

## Extension Settings

This extension contributes the following settings:

* `csharp-ls.trace.server`: Traces the communication between VS Code and the language server.
* `csharp-ls.csharp-ls-executable`: Executable path to local csharp-ls. To be used for testing not released csharp-ls version (value: `dotnet /home/user/.../Debug/net7.0/CSharpLanguageServer.dll`). It also can be used for globally installed server via `dotnet tool install --global csharp-ls` (value: `csharp-ls`).
* `csharp-ls.razor-support`: Enable experimental Razor support for `.cshtml` files. Default is `false`.
* `csharp-ls.applyFormattingOptions`: Use formatting options as supplied by the editor (may override `.editorconfig` values). Default is `false`.
* `csharp-ls.analyzersEnabled`: Run Roslyn analyzers (e.g. IDE style rules, third-party NuGet analyzers) as part of diagnostics. Increases diagnostic latency and CPU usage. Default is `false`.

## Building from Source

To build the VSIX package for this extension:

1. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

2. **Build the VSIX package**:
   ```bash
   npm run build
   ```

   Or directly:
   ```bash
   vsce package
   ```

This will create a `.vsix` file (e.g., `csharp-ls-0.0.29.vsix`) in the root directory.

### Installing the VSIX

Once built, you can install it via:
- **Command line**: `code --install-extension csharp-ls-0.0.29.vsix`
- **VS Code UI**: Extensions → `...` menu → "Install from VSIX..."
