# @skapxd/tree

[![CI](https://github.com/skapxd/tree/actions/workflows/ci.yml/badge.svg)](https://github.com/skapxd/tree/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@skapxd%2Ftree.svg)](https://badge.fury.io/js/@skapxd%2Ftree)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Project structure and relationship visualizer for codebases, docs, and AI-agent context.

`@skapxd/tree` gives you three useful views:

- Directory tree with line counts.
- File outline for supported source and Markdown files.
- Related-file graph for local imports and local Markdown links.

It is optimized for quick human inspection and for AI agents that need bounded, high-signal context before editing.

## Quick Start

Run without installing:

```bash
# Directory tree
npx @skapxd/tree
npx @skapxd/tree ./src

# File outline
npx @skapxd/tree src/index.ts
npx @skapxd/tree docs/README.md

# Related files by imports or local Markdown links
npx @skapxd/tree src/routes/page.tsx -r
npx @skapxd/tree docs/index.md -r
```

Install globally if you use it often:

```bash
npm install -g @skapxd/tree
tree ./src
```

## Directory Tree Mode

Point the command to a directory to print a compact tree.

```bash
npx @skapxd/tree ./src
npx @skapxd/tree ./src --only-folder
npx @skapxd/tree ./src --ignore "node_modules|dist|coverage"
```

Example:

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

The directory scan respects `.gitignore` and filters common noise such as `.git` and `.DS_Store`.
The final summary counts the visible tree only, so ignored files and directories are not included.
`largest files` skips dependency lockfiles such as `yarn.lock`, `package-lock.json`,
`pnpm-lock.yaml`, and `bun.lockb` so the outlier list stays useful for code review.

## File Outline Mode

Point the command to a supported file to print a structural outline without loading the full implementation.

```bash
npx @skapxd/tree src/index.ts
npx @skapxd/tree src/components/Button.tsx
npx @skapxd/tree src/pages/index.astro
npx @skapxd/tree docs/README.md
```

Supported outline files:

- TypeScript: `.ts`, `.tsx`
- JavaScript: `.js`, `.jsx`, `.mjs`, `.cjs`
- Markdown: `.md`, `.markdown`
- Astro: `.astro`

Example:

```text
       Lines │ Type       │ Symbol
─────────────┼────────────┼────────────────────────────────────────
         1-1 │ import     │ ├── fs
         2-2 │ import     │ ├── path
        10-15│ interface  │ ├── User
        18-25│ func       │ ├── getUser
        30-45│ class      │ └── UserService
```

## Related Files Mode

Use `-r` or `--related` on a supported file to build a local relationship graph.

```bash
npx @skapxd/tree src/routes/page.tsx -r
npx @skapxd/tree docs/index.md -r
```

This is the most useful mode before changing code or documentation because it separates two questions:

- What does this target depend on?
- What depends on this target and could break?

### Code Relationships

For code files, the labels are:

- `imports`: local files imported by the target.
- `imported by`: local files that import the target.

```text
Related files for src/lib/api.ts
├── imports (2)
│   └── src/lib/http.ts
│       └── src/lib/logger.ts
└── imported by (2)
    ├── src/routes/page.tsx
    └── src/components/UserCard.tsx
```

The resolver handles:

- relative imports
- extensionless imports
- directory `index.*` imports
- Astro frontmatter imports
- CommonJS `require()`
- dynamic `import()`
- re-exports
- `tsconfig.json` `baseUrl` and `paths`

External packages such as `react` are intentionally excluded.

### Markdown Relationships

For Markdown files, the labels switch to document language:

- `links`: local Markdown files linked by the target document.
- `linked by`: local Markdown files that link to the target document.

```text
Related files for docs/index.md - Documentation Index (24 lines)
├── links (1)
│   └── docs/guide.md (68 lines)
│       ├── title: User Guide
│       └── link source: docs/index.md:12 "Guide"
└── linked by (1)
    └── README.md (260 lines)
        ├── title: @skapxd/tree
        └── link source: README.md:253 "Documentation"

summary
├── files shown: 3 files
├── related files: 2 files
├── total lines: 352 lines
├── median lines per file: 68 lines
├── max relationship depth: 1
└── largest files
    ├── README.md (260 lines)
    ├── docs/guide.md (68 lines)
    └── docs/index.md (24 lines)
```

The full related tree ends with a context summary so agents can judge the size of
the visible graph before reading files.

The resolver handles:

- inline links: `[Guide](./guide.md#setup)`
- reference definitions: `[guide]: ./guide.md`
- root-relative links: `[Guide](/docs/guide.md)`
- backlinks through `linked by`

It intentionally ignores:

- external URLs
- `mailto:` and other protocol links
- pure anchors such as `#setup`
- images such as `![Diagram](./diagram.md)`
- links inside inline code and fenced code blocks

Broken local Markdown links are shown as `unresolved local links`.

Markdown tree nodes keep the file path and line count on the file row. The first available heading is rendered below the file as `title:` so it is not confused with the path:

```text
docs/agent-workflows.md (57 lines)
└── title: AI-Agent Workflow
```

Markdown edges render the source link text or reference label below the file as `link source:`:

```text
docs/guide.md (68 lines)
├── title: User Guide
└── link source: docs/index.md:12 "Guide"

docs/index.md (24 lines) -> ./missing.md
└── link source: docs/index.md:18 "Missing"
```

### Related Mode Options

```bash
# Both outgoing and incoming relationships
npx @skapxd/tree src/routes/page.tsx -r

# Only outgoing relationships
npx @skapxd/tree src/routes/page.tsx -r imports

# Only incoming relationships
npx @skapxd/tree src/lib/api.ts -r importers

# Direct relationships only
npx @skapxd/tree src/lib/api.ts -r both --depth 1

# Compact direct/transitive summary
npx @skapxd/tree src/lib/api.ts -r --summary

# Explicit nested tree, same as default
npx @skapxd/tree src/lib/api.ts -r --tree

# Monorepo or subproject root
npx @skapxd/tree apps/web/src/pages/index.astro -r --root apps/web
```

Supported related-file targets:

- Code: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.astro`
- Markdown: `.md`, `.markdown`

## AI-Agent Workflow

For large repositories, start with the related-file graph instead of reading the whole tree.

Recommended sequence:

1. Run `npx @skapxd/tree <target-file> -r`.
2. Read direct outgoing files first.
3. Follow transitive branches only when they explain the behavior being changed.
4. Read incoming files to understand risk.
5. Use `--depth 1` or `--summary` if the graph is too large.
6. Use normal text search after the graph exposes relevant names, contracts, or gaps.

The graph is static. It can miss runtime-only wiring such as dependency injection, framework routing conventions, generated code, config-driven behavior, or unresolvable dynamic imports.

## CLI Reference

```text
tree [options] [path]
```

| Flag | Description | Context |
| :--- | :--- | :--- |
| `[path]` | Directory or file to analyze. Defaults to current directory. | Both |
| `-d`, `--directory <dir>` | Specify a path as an alternative to the positional argument. | Both |
| `-i`, `--ignore [ig]` | Regex pattern to ignore. | Directory/Related |
| `-e`, `--export [epath]` | Export result to a file. | Both |
| `-f`, `--only-folder` | Output folders only. | Directory |
| `-r`, `--related [mode]` | Show related files. Modes: `imports`, `importers`, `both`. | File |
| `--root <dir>` | Project root for related-file scans. Defaults to current directory. | Related |
| `--depth <depth>` | Max traversal depth for related-file scans. Use `all` for full graph. | Related |
| `--summary` | Use the layered related-file summary. | Related |
| `--tree` | Use the full nested related-file tree. This is the default for `-r`. | Related |
| `-V`, `--version` | Print version. | Both |
| `-h`, `--help` | Print help. | Both |

## Full Documentation

The root README is the npm-facing overview. The same information is also segmented in `docs/` for deeper reading and local relationship searches:

- [Documentation index](docs/README.md)
- [Directory tree mode](docs/directory-tree.md)
- [File outline mode](docs/file-outline.md)
- [Related files mode](docs/related-files.md)
- [AI-agent workflow](docs/agent-workflows.md)
- [CLI reference](docs/cli-reference.md)
- [Development](docs/development.md)

## Development

```bash
yarn install
yarn lint
yarn typecheck
yarn test
yarn build
```

Linting uses `@skapxd/lint-agent` with the package preset as a strict gate:

- `yarn lint`: runs ESLint on maintained source files and fails on any violation.
- `yarn lint:full`: audits the full package preset through `skapxd-lint`.
- `yarn lint:adopt`: asks `skapxd-lint` for the next incremental adoption batch.
- `yarn lint:changed`: checks only git-changed files with the package preset.

`yarn start` runs the compiled CLI, so rebuild after source changes:

```bash
yarn build
yarn start ./src/cli.ts -r
```

## License

MIT
