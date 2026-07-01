---
name: skapxd-tree
description: Use @skapxd/tree before reading source files when you need compact codebase maps, file outlines, or related-file graphs for TypeScript, JavaScript, Astro, and Markdown projects.
---

# @skapxd/tree

Use `@skapxd/tree` to gather bounded structural context before opening full files. Prefer it when the task starts in an unfamiliar codebase, a large folder, a known source file, or a Markdown document with local links.

The command is pinned to `@skapxd/tree@1.3.0` so external security tools can evaluate a stable package version. Update the pin only when intentionally releasing and validating a new package version.

## Commands

```bash
npx --yes @skapxd/tree@1.3.0
npx --yes @skapxd/tree@1.3.0 ./src
npx --yes @skapxd/tree@1.3.0 ./src --only-folder
npx --yes @skapxd/tree@1.3.0 ./src --ignore "node_modules|dist|coverage|.next"
npx --yes @skapxd/tree@1.3.0 src/index.ts
npx --yes @skapxd/tree@1.3.0 src/routes/page.tsx -r
npx --yes @skapxd/tree@1.3.0 docs/index.md -r
```

## Workflow

1. Use directory mode first when the repository shape is unknown.
2. Use file outline mode before reading large `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.astro`, `.md`, or `.markdown` files.
3. Use related mode when the task starts from a known file and imports, importers, links, or backlinks determine context.
4. Read direct outgoing files first. For code, these are imports. For Markdown, these are local links.
5. Read incoming files next as risk surface. For code, these are importers. For Markdown, these are backlinks.
6. Follow transitive branches only when the direct files delegate behavior or documentation.
7. Use `--depth 1` or `--summary` when the graph is too large.
8. Use `--root <dir>` in monorepos when the target file belongs to a subproject.

## Interpretation

- File rows include lines, characters, and approximate tokens.
- The token estimate is `ceil(chars / 4)`, not exact model tokenization.
- Directory summaries count visible, non-ignored files only.
- `largest files by chars` is the main signal for context budget.
- `output context` is the estimated cost of pasting the command result itself into an agent.
- Symbolic links are shown as `name -> target`; related mode does not follow them.
- In code related mode, `imports` are dependencies and `imported by` are consumers.
- In Markdown related mode, `links` are outgoing documents and `linked by` are backlinks.
- `(seen)` means the file already appeared earlier in the graph.
- `(cycle)` means the relationship loops back to a file already in the current branch.

## Limits

The graph is static. It can miss runtime dependency injection, framework routing conventions, generated code, config-driven wiring, and dynamic imports that cannot be resolved statically.
