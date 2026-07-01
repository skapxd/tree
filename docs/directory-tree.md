# Directory Tree Mode

Use directory tree mode to inspect a folder structure without loading file contents.

```bash
npx @skapxd/tree
npx @skapxd/tree ./src
npx @skapxd/tree ./src --only-folder
npx @skapxd/tree ./src --ignore "node_modules|dist|coverage"
```

## Output

```text
src/
├── index.ts (2 lines)
├── cli.ts (120 lines)
└── file-tree/
    ├── index.ts (45 lines)
    └── parsers/
        └── tsx/
            └── index.ts (241 lines)

summary
├── directories: 2
├── files: 3
├── total lines: 408 lines
├── median lines per file: 120 lines
├── largest files
│   ├── file-tree/parsers/tsx/index.ts (241 lines)
│   ├── cli.ts (120 lines)
│   └── file-tree/index.ts (45 lines)
└── top extensions
    └── .ts: 3 files
```

The summary describes only the displayed tree. Ignored paths are not counted, and `--only-folder`
skips file and line totals.
`largest files` skips dependency lockfiles such as `yarn.lock`, `package-lock.json`,
`pnpm-lock.yaml`, and `bun.lockb`.

## Ignoring

The command respects `.gitignore` and filters common noise such as `.git` and `.DS_Store`.

Use `--ignore` for additional regular-expression filtering:

```bash
npx @skapxd/tree . --ignore "node_modules|dist|coverage|.next"
```

## Export

```bash
npx @skapxd/tree ./src --export /tmp/src-tree.txt
```
