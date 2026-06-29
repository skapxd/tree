# File Outline Mode

Use file outline mode to inspect a supported file without reading its full implementation.

```bash
npx @skapxd/tree src/index.ts
npx @skapxd/tree src/components/Button.tsx
npx @skapxd/tree docs/README.md
npx @skapxd/tree src/pages/index.astro
```

## Supported Files

- TypeScript: `.ts`, `.tsx`
- JavaScript: `.js`, `.jsx`, `.mjs`, `.cjs`
- Markdown: `.md`, `.markdown`
- Astro: `.astro`

## Output

```text
       Lines │ Type       │ Symbol
─────────────┼────────────┼────────────────────────────────────────
         1-1 │ import     │ ├── fs
         2-2 │ import     │ ├── path
        10-15│ interface  │ ├── User
        18-25│ func       │ ├── getUser
        30-45│ class      │ └── UserService
```

## Why Use It

Use outline mode before reading a large file. It gives enough structure to decide which symbols or sections deserve full inspection.
