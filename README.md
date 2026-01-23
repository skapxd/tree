# @skapxd/tree

[![CI](https://github.com/skapxd/tree/actions/workflows/ci.yml/badge.svg)](https://github.com/skapxd/tree/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/@skapxd%2Ftree.svg)](https://badge.fury.io/js/@skapxd%2Ftree)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Visualize your directory structure with professional ASCII art.**

A modern, TypeScript-based CLI tool designed to generate clean, tree-like diagrams of your folder structure. It is optimized for **Documentation** and **AI Context**, providing a token-efficient overview of your codebase.

## 🚀 Quick Start (No Installation)

The fastest way to use it is with `npx`. It works instantly in any directory.

```bash
# View current directory
npx @skapxd/tree

# View a specific folder
npx @skapxd/tree ./src
```

## 🤖 Optimized for AI Agents & LLMs

This tool is specifically designed to help AI Agents (like ChatGPT, Claude, Gemini, or GitHub Copilot) understand your project architecture **without consuming massive context windows**.

When you need an AI to understand your project structure, run this command and paste the output:

```bash
npx @skapxd/tree ./src
```

**Why is this better for AI?**
*   **Context Focus:** By targeting `./src`, you provide the AI with only the relevant business logic, avoiding noise.
*   **Token Efficient:** Uses minimal characters to convey maximum structural information.
*   **High Contrast:** Distinct separation between folders and files helps LLMs parse the hierarchy accurately.

## 🎨 Example Output

```text
src
├── index.ts
├── cli.ts
├── utils
│   ├── parser.ts
│   └── drawer.ts
└── components
    ├── Button.tsx
    └── Header.tsx
```

## ⚙️ Options

| Flag | Description | Example |
| :--- | :--- | :--- |
| `[dir]` | (Positional) Directory to scan. Defaults to current. | `npx @skapxd/tree ./src` |
| `-i`, `--ignore` | Regex pattern to ignore files/folders. | `-i "node_modules|dist"` |
| `-f`, `--only-folder` | Output only directories, hiding files. | `-f` |
| `-e`, `--export` | Save the output to a text file. | `-e structure.txt` |
| `-d`, `--directory` | (Alternative) Specify directory via flag. | `-d ./src` |

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