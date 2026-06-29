# Development

This package uses TypeScript, tsup, and Vitest.

## Install

```bash
yarn install
```

## Build

```bash
yarn build
```

The package builds both library and CLI entries into `dist/`.

## Typecheck

```bash
yarn typecheck
```

## Lint

```bash
yarn lint
```

Linting uses `@skapxd/eslint-opinionated` with the package preset as a strict gate.

- `yarn lint`: runs maintained source files and fails on any violation.
- `yarn lint:full`: runs the full package preset through `skapxd-lint`.
- `yarn lint:adopt`: asks `skapxd-lint` for a bounded adoption batch to decide what to fix first.
- `yarn lint:changed`: checks only git-changed files.

## Test

```bash
yarn test
```

## Local CLI

`yarn start` runs the compiled CLI, so rebuild after source changes:

```bash
yarn build
yarn start ./src/cli.ts -r
```

For direct Node execution:

```bash
node dist/cli.cjs ./src/cli.ts -r
```
