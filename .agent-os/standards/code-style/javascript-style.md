# Javascript Style Guide

## Semicolons
- Do not use semicolons
- Rely on Automatic Semicolon Insertion (ASI)

## String Formatting
- Use double quotes for strings: `"Hello World"`
- Prettier config: `singleQuote: false`

## Imports
- Use TypeScript path aliases with "@" prefix
- Import from "@/components", "@/types", "@/lib", etc.
- Create subdirectories with index.ts files for clean imports
- Import from directory index: `import { Component } from "@/components"` not `import Component from "@/components/Component"`

## Variable Naming
- Use camelCase for variable and function names
- Use PascalCase for type definitions and component names

## Type Definitions
- Place all type definitions in `src/types` directory
- Import types using "@/types" alias
- Use `type` instead of `interface` for type definitions
- Organize types by feature or domain when appropriate

## TypeScript Configuration
- Use strict mode with path aliases configured
- Avoid `any` types - use proper TypeScript typing
- Enable strict boolean expressions and unsafe operation checks
