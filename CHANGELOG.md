# [Unreleased]
- Add new configurables: csharp-ls.applyFormattingOptions and .analyzersEnabled (@razzmatazz)
- Update required .NET SDK version (@razzmatazz)
- Add configurable for --rpclog (@razzmatazz)
- Replace razor-support config with middleware-based configuration (@razzmatazz)
- Add csharp-ls.debugMode setting (@razzmatazz)

# [0.0.31]
- [csharp-ls@0.23.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.23.0)

# [0.0.30]
- Add user setting to enable support for .cshtml (razor) files (@razzmatazz)
- Add instruction to build and install the extension from source (@razzmatazz)
- [csharp-ls@0.22.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.22.0)

# [0.0.29]
- Reenable metadata uris (@razzmatazz)
- [csharp-ls@0.21.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.21.0). From now on NET 10 SDK is required.

# [0.0.28]
- [csharp-ls@0.20.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.20.0)

# [0.0.27]
- [csharp-ls@0.19.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.19.0)

# [0.0.26]
- [csharp-ls@0.18.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.18.0)

# [0.0.25]
- [csharp-ls@0.17.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.17.0)

# [0.0.24]
- [csharp-ls@0.16.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.16.0)

# [0.0.23]
- [csharp-ls@0.15.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.15.0)

# [0.0.22]
- [csharp-ls@0.14.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.14.0)

# [0.0.21]
- [csharp-ls@0.13.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.13.0)

# [0.0.20]
- Make sure `csharp-ls.csharp-ls-executable` setting is actually taken into account (@razzmatazz).
- [csharp-ls@0.11.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.11.0). From now on NET 8 SDK is required. (@razzmatazz)
- improve error messages when dotnet is not found or version is not supported

# [0.0.19]
- [csharp-ls@0.10.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.10.0)

# [0.0.18]
- [csharp-ls@0.9.0](https://github.com/razzmatazz/csharp-language-server/releases/tag/0.9.0)
- "Go to definition" to decompiled metadata
- activate extension only when sln file exists in workspace or when command is triggered manually
- ability to select target solution
- save previous solution selection and autostart language server if we have it saved
- autostart language server if workspace contains single sln file
- ability to use custom build and not released csharp-ls version
