# CLI Reference

```text
tree [options] [path]
```

## Arguments

| Argument | Description |
| :--- | :--- |
| `[path]` | Directory or file to analyze. Defaults to the current directory. |

## Options

| Flag | Description | Context |
| :--- | :--- | :--- |
| `-d`, `--directory <dir>` | Specify a path as an alternative to the positional argument. | Both |
| `-i`, `--ignore [ig]` | Literal pattern to ignore. Use `|` for alternatives. | Directory/Related |
| `-e`, `--export [epath]` | Export result to a file. | Both |
| `-f`, `--only-folder` | Output folders only. | Directory |
| `-r`, `--related [mode]` | Show related files. Modes: `imports`, `importers`, `both`. | File |
| `--root <dir>` | Project root for related-file scans. Defaults to current directory. | Related |
| `--depth <depth>` | Max traversal depth for related-file scans. Use `all` for full graph. | Related |
| `--summary` | Use the layered related-file summary. | Related |
| `--tree` | Use the full nested related-file tree. This is the default for `-r`. | Related |
| `-V`, `--version` | Print version. | Both |
| `-h`, `--help` | Print help. | Both |

Directory output ends with a compact summary of the displayed tree: directories, files, total lines,
total chars, approximate tokens, median file size, max line length, largest files by chars, and top extensions.
Binary and media files remain visible as files, but they are excluded from line/char/token text-context totals.
The largest-file ranking skips dependency lockfiles such as `yarn.lock`, `package-lock.json`,
`pnpm-lock.yaml`, and `bun.lockb`.
Symbolic links are rendered as `name -> target`; they are not followed or counted as files.

Related tree output also ends with a context summary for the related set: unique files shown,
related files, total lines, total chars, approximate tokens, median file size, deepest relationship,
unresolved references when present, and the five largest files by chars. The `--summary` flag is separate: it switches the related
view to a compact direct/transitive layout instead of the nested tree.
Non-text files in the related set are listed without text stats and excluded from text-context totals.
Related mode does not follow symbolic links. Passing a symlink target to `-r` fails with a clear error,
and imports that resolve only through symlinks remain unresolved.

Every rendered CLI output ends with `output context`, which measures the visible command output itself:
characters and approximate tokens after stripping terminal color escape sequences. This is the cost of
pasting the tree result into an agent, not the cost of the source files. It does not include shell prompts
or package-manager wrapper output.

## Examples

```bash
npx @skapxd/tree
npx @skapxd/tree ./src --ignore "dist|coverage"
npx @skapxd/tree src/index.ts
npx @skapxd/tree src/routes/page.tsx -r
npx @skapxd/tree src/routes/page.tsx -r imports
npx @skapxd/tree docs/index.md -r
npx @skapxd/tree apps/web/src/routes/page.tsx -r --root apps/web
```
