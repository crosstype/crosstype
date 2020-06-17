# @crosstype/build-tools

Internal build tools for the CrossType suite.

## Generator

The `generator` tool allows integration of custom generators in the compilation process via specification in `tsconfig.conf`.

- Generators are plugged into tsc via a [ts-patch](https://npmjs.com/ts-patch) `Program` transformer. 
- Each generator has a watch-file list
- When changes are triggered in a watched file, the generator runs, outputs files, and optionally rebuilds the `Program` 
  instance prior to tsc compilation (if building SourceFiles)
  
Generators can be used to build source files as well as markdown templates, documentation, etc.

## Pre-release Disclaimer

Code is considered `pre-release` status and is therefore subject to change until we reach an RC!

We welcome you to join in the discussion and development effort!
