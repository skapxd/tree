# Development

This package uses TypeScript, tsup, and Vitest.

Development uses pnpm 11 and requires Node.js 22.13 or newer.

## Install

```bash
pnpm install
```

## Build

```bash
pnpm build
```

The package builds both library and CLI entries into `dist/`.

## Typecheck

```bash
pnpm typecheck
```

## Lint

```bash
pnpm lint
```

Linting uses `@skapxd/lint-agent` with the package preset as a strict gate.

- `pnpm lint`: runs maintained source files and fails on any violation.
- `pnpm lint:full`: runs the full package preset through `skapxd-lint`.
- `pnpm lint:adopt`: asks `skapxd-lint` for a bounded adoption batch to decide what to fix first.
- `pnpm lint:changed`: checks only git-changed files.

## Test

```bash
pnpm test
```

## Local CLI

`pnpm start` runs the compiled CLI, so rebuild after source changes:

```bash
pnpm build
pnpm start ./src/cli.ts -r
```

For direct Node execution:

```bash
node dist/cli.cjs ./src/cli.ts -r
```
