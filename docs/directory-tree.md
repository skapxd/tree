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
├── index.ts (2 lines, 64 chars, ~16 tokens)
├── cli.ts (120 lines, 8,400 chars, ~2,100 tokens)
└── file-tree/
    ├── index.ts (45 lines, 2,700 chars, ~675 tokens)
    └── parsers/
        └── tsx/
            └── index.ts (241 lines, 16,200 chars, ~4,050 tokens)

summary
├── directories: 3
├── files: 4
├── total lines: 408 lines
├── total chars: 27,364 chars
├── estimated tokens: ~6,841 tokens
├── median lines per file: 83 lines
├── median chars per file: 5,550 chars
├── max line length: 160 chars
├── largest files by chars
│   ├── file-tree/parsers/tsx/index.ts (241 lines, 16,200 chars, ~4,050 tokens)
│   ├── cli.ts (120 lines, 8,400 chars, ~2,100 tokens)
│   ├── file-tree/index.ts (45 lines, 2,700 chars, ~675 tokens)
│   └── index.ts (2 lines, 64 chars, ~16 tokens)
└── top extensions
    └── .ts: 4 files

output context
└── command output: 1,245 chars, ~312 tokens
```

The summary describes only the displayed tree. Ignored paths are not counted, and `--only-folder`
skips file text stats.
Character counts use file text length, and token counts are an approximate `chars / 4` estimate for
code-agent context planning. `largest files by chars` skips dependency lockfiles such as `yarn.lock`, `package-lock.json`,
`pnpm-lock.yaml`, and `bun.lockb`.
The final `output context` block measures the visible output that would be pasted into an agent,
excluding shell prompts, wrapper output, and terminal color escape sequences.

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
