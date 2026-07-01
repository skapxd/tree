# @skapxd/tree Documentation

`@skapxd/tree` gives a compact view of a project without reading every file. It has three main modes:

- Directory tree: show folders and files with line, character, and token-estimate counts.
- File outline: show imports, symbols, functions, classes, headings, and Astro/template structure.
- Related files: show local code dependencies and local Markdown links around a target file.

## Core Docs

- [Directory tree mode](directory-tree.md)
- [File outline mode](file-outline.md)
- [Related files mode](related-files.md)
- [AI-agent workflow](agent-workflows.md)
- [CLI reference](cli-reference.md)
- [Development](development.md)

## Fast Commands

```bash
npx @skapxd/tree
npx @skapxd/tree ./src
npx @skapxd/tree src/index.ts
npx @skapxd/tree src/routes/page.tsx -r
npx @skapxd/tree docs/index.md -r
```
