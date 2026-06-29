# Related Files Mode

Use related files mode to map local relationships around one target file.

```bash
npx @skapxd/tree src/routes/page.tsx -r
npx @skapxd/tree docs/index.md -r
```

This mode is designed for change planning:

- Use the outgoing side to understand what the target depends on.
- Use the incoming side to understand what could break if the target changes.

## Code Relationships

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

## Markdown Relationships

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
```

## Supported Targets

- Code: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, `.astro`
- Markdown: `.md`, `.markdown`

## Supported Code Resolution

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

## Supported Markdown Links

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

Broken local links are shown as `unresolved local links`.

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

## Modes

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
```

## Monorepos

Use `--root` when the target project is not the current working directory:

```bash
npx @skapxd/tree apps/web/src/routes/page.tsx -r --root apps/web
```
