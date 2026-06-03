# @skapxd/tree

[![CI](https://github.com/skapxd/tree/actions/workflows/ci.yml/badge.svg)](https://github.com/skapxd/tree/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@skapxd%2Ftree.svg)](https://badge.fury.io/js/@skapxd%2Ftree)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Visualize your project structure: Directories & File Outlines.**

A modern, TypeScript-based CLI tool that intelligently adapts to your input.
- **Directories:** Generates a clean, ASCII tree diagram of folders and files.
- **Line counts:** Shows the number of lines for each file in directory mode, dimmed in color terminals.
- **Files:** Generates a structural outline (symbols, functions, classes) in a clean tabular format.

Optimized for **Documentation** and **AI Context**, providing a token-efficient overview of your codebase.

## 🚀 Quick Start (No Installation)

The fastest way to use it is with `npx`. It works instantly in any directory.

```bash
# 📂 Directory Mode: View folder structure
npx @skapxd/tree

# 📂 Directory Mode: View specific folder
npx @skapxd/tree ./src

# 📄 File Mode: View file structure (Outline)
npx @skapxd/tree src/index.ts
```

## 📄 File Outline Mode

Point `tree` to a supported file to see a high-level overview of its contents without reading the whole code.

**Supported Formats:**
- **TypeScript:** `.ts`, `.tsx`
- **JavaScript:** `.js`, `.jsx`, `.mjs`, `.cjs`
- **Markdown:** `.md`
- **Astro:** `.astro`

**Example Output:**
```text
       Lines │ Type       │ Symbol
─────────────┼────────────┼────────────────────────────────────────
         1-1 │ import     │ ├── fs
         2-2 │ import     │ ├── path
        10-15│ interface  │ ├── User
        18-25│ func       │ ├── getUser
        19-19│ var        │ │   └── id
        30-45│ class      │ └── UserService
        32-35│ meth       │     └── fetch
```

## 🤖 Optimized for AI Agents & LLMs

This tool is specifically designed to help AI Agents (like ChatGPT, Claude, Gemini, or GitHub Copilot) understand your project architecture **without consuming massive context windows**.

**Why is this better for AI?**
*   **Context Focus:** Provide only the relevant structural information (filenames or function signatures), avoiding implementation noise.
*   **Token Efficient:** Uses minimal characters to convey maximum structural information.
*   **High Contrast:** Distinct separation between structural elements helps LLMs parse the hierarchy accurately.

## 🎨 Directory Example Output

```text
src/
├── index.ts (2 lines)
├── cli.ts (81 lines)
├── utils/
│   ├── parser.ts (115 lines)
│   └── drawer.ts (70 lines)
└── components/
    ├── Button.tsx (42 lines)
    └── Header.tsx (38 lines)
```

## 🛡️ Smart Ignoring

By default, the tool **automatically respects your `.gitignore` file**.
It also filters out common clutter like `.git` and `.DS_Store` to ensure clean, AI-ready output.

## ⚙️ Options

| Flag | Description | Context |
| :--- | :--- | :--- |
| `[path]` | (Positional) Directory or File to scan. Defaults to current dir. | Both |
| `-i`, `--ignore` | Override default ignore patterns with a custom regex. | Directory |
| `-f`, `--only-folder` | Output only directories, hiding files. | Directory |
| `-e`, `--export` | Save the output to a text file. | Both |
| `-d`, `--directory` | (Alternative) Specify path via flag. | Both |

## 📦 Installation (Optional)

If you use it frequently, you can install it globally:

```bash
npm install -g @skapxd/tree
# or
pnpm add -g @skapxd/tree
```

Then run it simply as:
```bash
tree
# or
npx @skapxd/tree
```

## 🛠️ Development

This project uses **TypeScript**, **Tsup** for bundling, and **Vitest** for testing.

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Run tests
yarn test
```

## 📄 License

MIT
