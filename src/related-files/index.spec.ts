import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildDependencyGraph,
  formatRelatedFilesSummary,
  formatRelatedFilesTree,
  getRelatedFiles,
  type RelatedFileEntry,
} from './index';

function writeProjectFile(root: string, relativePath: string, content: string): void {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function toProjectPaths(root: string, entries: RelatedFileEntry[]): string[] {
  return entries.map(entry => path.relative(root, entry.file).split(path.sep).join('/')).sort();
}

describe('related-files module', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'related-files-test-'));

    writeProjectFile(
      tempDir,
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
          },
        },
      })
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('finds transitive imports and importers across ts, tsx, jsx, and astro frontmatter', () => {
    writeProjectFile(tempDir, 'src/utils/format.ts', 'export const format = () => "ok";\n');
    writeProjectFile(
      tempDir,
      'src/utils/api.ts',
      "import { format } from './format';\nexport const getValue = () => format();\n"
    );
    writeProjectFile(
      tempDir,
      'src/components/Button.tsx',
      "import { getValue } from '../utils/api';\nexport const Button = () => <button>{getValue()}</button>;\n"
    );
    writeProjectFile(
      tempDir,
      'src/components/Card.astro',
      "---\nimport { Button } from './Button';\n---\n<Button />\n"
    );
    writeProjectFile(
      tempDir,
      'src/pages/home.astro',
      "---\nimport Card from '../components/Card.astro';\nimport { getValue } from '../utils/api';\n---\n<Card />\n"
    );
    writeProjectFile(
      tempDir,
      'src/routes/home.jsx',
      "const { getValue } = require('../utils/api');\nimport('../components/Button');\nconsole.log(getValue);\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/utils/api.ts'),
      root: tempDir,
      direction: 'both',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['src/utils/format.ts']);
    expect(toProjectPaths(tempDir, result.importers)).toEqual([
      'src/components/Button.tsx',
      'src/components/Card.astro',
      'src/pages/home.astro',
      'src/routes/home.jsx',
    ]);
  });

  it('resolves tsconfig path aliases and directory indexes', () => {
    writeProjectFile(tempDir, 'src/components/Button/index.tsx', 'export const Button = () => null;\n');
    writeProjectFile(
      tempDir,
      'src/routes/page.tsx',
      "import { Button } from '@/components/Button';\nexport const Page = Button;\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/routes/page.tsx'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['src/components/Button/index.tsx']);
  });

  it('extracts astro frontmatter imports when the fence has trailing whitespace', () => {
    writeProjectFile(tempDir, 'src/layouts/Layout.astro', '<slot />\n');
    writeProjectFile(tempDir, 'src/components/AppContent.astro', '<main />\n');
    writeProjectFile(
      tempDir,
      'src/pages/app.astro',
      "--- \nimport Layout from '../layouts/Layout.astro';\nimport AppContent from '../components/AppContent.astro';\n---\n<Layout><AppContent /></Layout>\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/pages/app.astro'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/components/AppContent.astro',
      'src/layouts/Layout.astro',
    ]);
  });

  it('extracts supported astro inline script imports', () => {
    writeProjectFile(tempDir, 'src/lib/client.ts', 'export const client = true;\n');
    writeProjectFile(tempDir, 'src/lib/module.ts', 'export const module = true;\n');
    writeProjectFile(tempDir, 'src/lib/skipped.ts', 'export const skipped = true;\n');
    writeProjectFile(
      tempDir,
      'src/pages/app.astro',
      "---\nconst title = 'App';\n---\n<script>\nimport '../lib/client';\n</script>\n<script type=\"module\">\nconst name = 'module';\nimport(`../lib/${name}`);\n</script>\n<script type=\"application/ld+json\">\nimport '../lib/skipped';\n</script>\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/pages/app.astro'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/lib/client.ts',
      'src/lib/module.ts',
    ]);
  });

  it('resolves dynamic imports from static string expressions', () => {
    writeProjectFile(tempDir, 'src/pages/Menu.astro', '<menu />\n');
    writeProjectFile(tempDir, 'src/pages/Admin.astro', '<admin />\n');
    writeProjectFile(tempDir, 'src/pages/User.astro', '<user />\n');
    writeProjectFile(
      tempDir,
      'src/router.ts',
      "const section = 'pages';\nconst menu = 'Menu';\nconst admin = './' + section + '/Admin.astro';\nconst role = isAdmin ? 'Admin' : 'User';\nimport(`./${section}/${menu}.astro`);\nimport(admin);\nimport(`./pages/${role}.astro`);\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/router.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/pages/Admin.astro',
      'src/pages/Menu.astro',
      'src/pages/User.astro',
    ]);
  });

  it('does not resolve dynamic imports from runtime string expressions', () => {
    writeProjectFile(tempDir, 'src/pages/Menu.astro', '<menu />\n');
    writeProjectFile(
      tempDir,
      'src/router.ts',
      "let page = 'Menu';\nimport(`./pages/${page}.astro`);\nconst runtimePage = getPage();\nimport(`./pages/${runtimePage}.astro`);\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/router.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(result.imports).toEqual([]);
  });

  it('extracts import type expressions', () => {
    writeProjectFile(tempDir, 'src/types/index.ts', 'export type Role = "admin";\n');
    writeProjectFile(
      tempDir,
      'src/page.astro',
      "---\nlet users: Array<{ role: import('@/types/index.ts').Role }> = [];\n---\n<div />\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/page.astro'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['src/types/index.ts']);
  });

  it('resolves declaration files from extensionless imports', () => {
    writeProjectFile(tempDir, 'src/request/types.d.ts', 'export type Response = string;\n');
    writeProjectFile(tempDir, 'src/shared.d.ts', 'export type Shared = string;\n');
    writeProjectFile(
      tempDir,
      'src/request/use.ts',
      "import type { Response } from './types';\nimport type { Shared } from '@/shared';\nexport const value: Response | Shared = 'ok';\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/request/use.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/request/types.d.ts',
      'src/shared.d.ts',
    ]);
    expect(result.unresolved).toEqual([]);
  });

  it('does not follow symbolic links while resolving related files', () => {
    writeProjectFile(tempDir, 'src/real.ts', 'export const real = true;\n');
    writeProjectFile(tempDir, 'src/entry.ts', "import './link';\nexport const entry = true;\n");
    fs.symlinkSync('real.ts', path.join(tempDir, 'src/link.ts'));

    const graph = buildDependencyGraph({ root: tempDir });
    const scannedFiles = graph.files.map(file => path.relative(tempDir, file));

    expect(scannedFiles).toContain('src/real.ts');
    expect(scannedFiles).not.toContain('src/link.ts');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/entry.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(result.imports).toEqual([]);
    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/entry.ts'),
        specifier: './link',
      },
    ]);
  });

  it('rejects symbolic link targets before traversing related files', () => {
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.symlinkSync('link-b.ts', path.join(tempDir, 'src/link-a.ts'));
    fs.symlinkSync('link-a.ts', path.join(tempDir, 'src/link-b.ts'));

    expect(() => getRelatedFiles({
      file: path.join(tempDir, 'src/link-a.ts'),
      root: tempDir,
      direction: 'imports',
    })).toThrow('Related files mode does not follow symbolic links');
  });

  it('does not report path aliases that target node_modules as unresolved local imports', () => {
    writeProjectFile(
      tempDir,
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          baseUrl: '.',
          paths: {
            '@/*': ['src/*'],
            react: ['./node_modules/@types/react'],
          },
        },
      })
    );
    writeProjectFile(tempDir, 'src/helper.ts', 'export const helper = true;\n');
    writeProjectFile(
      tempDir,
      'src/entry.tsx',
      "import React from 'react';\nimport { helper } from '@/helper';\nimport './missing';\nexport const Entry = () => <div>{String(helper || React)}</div>;\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/entry.tsx'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['src/helper.ts']);
    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/entry.tsx'),
        specifier: './missing',
      },
    ]);
  });

  it('resolves exact and wildcard tsconfig paths without baseUrl from the scan root', () => {
    writeProjectFile(
      tempDir,
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: {
            '@exact': ['src/exact.ts'],
            '@app/*': ['src/app/*'],
          },
        },
      })
    );
    writeProjectFile(tempDir, 'src/exact.ts', 'export const exact = true;\n');
    writeProjectFile(tempDir, 'src/app/foo.ts', 'export const foo = true;\n');
    writeProjectFile(
      tempDir,
      'src/entry.ts',
      "import '@exact';\nimport '@app/foo';\nimport '@exact-extra';\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/entry.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/app/foo.ts',
      'src/exact.ts',
    ]);
    expect(result.unresolved).toEqual([]);
  });

  it('honors maxDepth when traversing importer chains', () => {
    writeProjectFile(tempDir, 'src/utils/format.ts', 'export const format = () => "ok";\n');
    writeProjectFile(
      tempDir,
      'src/utils/api.ts',
      "import { format } from './format';\nexport const getValue = () => format();\n"
    );
    writeProjectFile(
      tempDir,
      'src/components/Button.tsx',
      "import { getValue } from '../utils/api';\nexport const Button = () => getValue();\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/utils/format.ts'),
      root: tempDir,
      direction: 'importers',
      maxDepth: 1,
    });

    expect(toProjectPaths(tempDir, result.importers)).toEqual(['src/utils/api.ts']);
  });

  it('reports unresolved local imports for scanned related files', () => {
    writeProjectFile(
      tempDir,
      'src/feature.ts',
      "import './missing';\nexport const feature = true;\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/feature.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/feature.ts'),
        specifier: './missing',
      },
    ]);
    expect(formatRelatedFilesSummary(result)).toContain('Unresolved local imports (1)');
    expect(formatRelatedFilesTree(result)).toContain('unresolved local imports (1)');
  });

  it('does not report explicit unsupported asset imports as unresolved code imports', () => {
    writeProjectFile(
      tempDir,
      'src/pages/page.astro',
      "---\nimport '../styles/global.css';\nimport './missing';\n---\n<div />\n"
    );
    writeProjectFile(tempDir, 'src/styles/global.css', 'body {}\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/pages/page.astro'),
      root: tempDir,
      direction: 'imports',
    });

    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/pages/page.astro'),
        specifier: './missing',
      },
    ]);
  });

  it('renders a layered summary that separates implementation path from risk surface', () => {
    writeProjectFile(tempDir, 'src/shared.ts', 'export const shared = true;\n');
    writeProjectFile(tempDir, 'src/use-case.ts', "import './shared';\nexport const useCase = true;\n");
    writeProjectFile(tempDir, 'src/controller.ts', "import './use-case';\nexport const controller = true;\n");
    writeProjectFile(tempDir, 'src/module.ts', "import './controller';\nexport const module = true;\n");

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/controller.ts'),
      root: tempDir,
      direction: 'both',
    });
    const output = formatRelatedFilesSummary(result);

    expect(output).toContain('Implementation path (imports)');
    expect(output).toContain('├── direct imports (1)');
    expect(output).toContain('│   └── src/use-case.ts');
    expect(output).toContain('└── transitive imports (1)');
    expect(output).toContain('depth 2 (1)');
    expect(output).toContain('src/shared.ts');
    expect(output).toContain('Risk surface (imported by)');
    expect(output).toContain('├── direct importers (1)');
    expect(output).toContain('│   └── src/module.ts');

    const treeOutput = formatRelatedFilesTree(result);

    expect(treeOutput).toContain('\n\nsummary\n');
    expect(treeOutput).toContain('files shown: 4 files');
    expect(treeOutput).toContain('related files: 3 files');
    expect(treeOutput).toContain('total lines: 7 lines');
    expect(treeOutput).toContain('total chars: 180 chars');
    expect(treeOutput).toContain('estimated tokens: ~45 tokens');
    expect(treeOutput).toContain('median lines per file: 2 lines');
    expect(treeOutput).toContain('median chars per file: 50 chars');
    expect(treeOutput).toContain('max line length: 31 chars');
    expect(treeOutput).toContain('max relationship depth: 2');
    expect(treeOutput).toContain('largest files by chars');
    expect(treeOutput).toContain('src/controller.ts (2 lines, 53 chars, ~14 tokens)');
    expect(treeOutput).toContain('src/module.ts (2 lines, 51 chars, ~13 tokens)');
    expect(treeOutput).toContain('src/use-case.ts (2 lines, 48 chars, ~12 tokens)');
  });

  it('renders notes for entrypoints and explicit direct-depth scans', () => {
    writeProjectFile(tempDir, 'src/leaf.ts', 'export const leaf = true;\n');
    writeProjectFile(tempDir, 'src/entry.ts', "import './leaf';\nexport const entry = true;\n");

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/entry.ts'),
      root: tempDir,
      direction: 'both',
      maxDepth: 1,
    });
    const output = formatRelatedFilesSummary(result);

    expect(output).toContain('Notes');
    expect(output).toContain('no local importers found');
    expect(output).toContain('depth is limited to direct relationships');
  });

  it('renders cycles, repeated branches, and empty groups without duplicating traversal forever', () => {
    writeProjectFile(
      tempDir,
      'src/a.ts',
      "import './b';\nimport './c';\nexport const a = true;\n"
    );
    writeProjectFile(tempDir, 'src/b.ts', "import './c';\nexport const b = true;\n");
    writeProjectFile(tempDir, 'src/c.ts', "import './a';\nexport const c = true;\n");
    writeProjectFile(tempDir, 'src/leaf.ts', 'export const leaf = true;\n');

    const cyclicResult = getRelatedFiles({
      file: path.join(tempDir, 'src/a.ts'),
      root: tempDir,
      direction: 'imports',
    });
    const cyclicOutput = formatRelatedFilesTree(cyclicResult);

    expect(cyclicOutput).toContain('src/a.ts (3 lines, 51 chars, ~13 tokens) (cycle)');
    expect(cyclicOutput).toContain('src/c.ts (2 lines, 37 chars, ~10 tokens) (seen)');
    expect(cyclicOutput).not.toContain('imported by');

    const leafResult = getRelatedFiles({
      file: path.join(tempDir, 'src/leaf.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(formatRelatedFilesTree(leafResult)).toContain('└── (none)');
  });

  it('supports re-exports, import equals, extension substitution, and baseUrl imports', () => {
    writeProjectFile(tempDir, 'src/value.ts', 'export const value = 1;\n');
    writeProjectFile(tempDir, 'src/base.ts', 'export const base = 1;\n');
    writeProjectFile(
      tempDir,
      'src/entry.ts',
      "export { value } from './value.js';\nimport legacy = require('src/base');\nexport const entry = legacy;\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/entry.ts'),
      root: tempDir,
      direction: 'imports',
      maxDepth: 1,
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/base.ts',
      'src/value.ts',
    ]);
  });

  it('resolves extensionless imports whose basename contains dots', () => {
    writeProjectFile(tempDir, 'src/app.controller.ts', 'export const controller = true;\n');
    writeProjectFile(tempDir, 'src/modules/users/users.module.ts', 'export const module = true;\n');
    writeProjectFile(
      tempDir,
      'src/app.module.ts',
      "import './app.controller';\nimport './modules/users/users.module';\nimport './missing.controller';\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/app.module.ts'),
      root: tempDir,
      direction: 'imports',
      maxDepth: 1,
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'src/app.controller.ts',
      'src/modules/users/users.module.ts',
    ]);
    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/app.module.ts'),
        specifier: './missing.controller',
      },
    ]);
  });

  it('ignores external packages but reports unresolved path aliases', () => {
    writeProjectFile(
      tempDir,
      'src/external.ts',
      "import React from 'react';\nimport missing from '@/missing';\nexport const external = React || missing;\n"
    );

    const result = getRelatedFiles({
      file: path.join(tempDir, 'src/external.ts'),
      root: tempDir,
      direction: 'imports',
    });

    expect(result.imports).toEqual([]);
    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'src/external.ts'),
        specifier: '@/missing',
      },
    ]);
  });

  it('finds local markdown links and backlinks without treating external links or images as related files', () => {
    writeProjectFile(
      tempDir,
      'docs/index.md',
      [
        '# Docs',
        '',
        '[Guide](./guide.md#setup)',
        '[API][api-doc]',
        '![Diagram](./diagram.md)',
        '[External](https://example.com)',
        '[Anchor](#local)',
        '',
        '[api-doc]: ./api.md "API docs"',
      ].join('\n')
    );
    writeProjectFile(tempDir, 'docs/guide.md', '[API](./api.md)\n');
    writeProjectFile(tempDir, 'docs/api.md', '# API\n');
    writeProjectFile(tempDir, 'docs/diagram.md', '# Diagram should not be linked by image syntax\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'docs/index.md'),
      root: tempDir,
      direction: 'both',
    });
    const output = formatRelatedFilesTree(result);

    expect(toProjectPaths(tempDir, result.imports)).toEqual([
      'docs/api.md',
      'docs/guide.md',
    ]);
    expect(output).toContain('links (2)');
    expect(output).toContain('docs/index.md - Docs');
    expect(output).toContain('docs/api.md (1 line, 6 chars, ~2 tokens)');
    expect(output).toContain('title: API');
    expect(output).toContain('linked by (0)');
    expect(output).not.toContain('docs/diagram.md');
    expect(output).not.toContain('https://example.com');

    const apiResult = getRelatedFiles({
      file: path.join(tempDir, 'docs/api.md'),
      root: tempDir,
      direction: 'importers',
    });
    const apiOutput = formatRelatedFilesTree(apiResult);

    expect(toProjectPaths(tempDir, apiResult.importers)).toEqual([
      'docs/guide.md',
      'docs/index.md',
    ]);
    expect(apiOutput).toContain('linked by (2)');
  });

  it('enriches markdown tree labels with headings, line counts, and link metadata', () => {
    writeProjectFile(tempDir, 'docs/index.md', '# Docs Index\n[`Guide`](./guide.md)\n');
    writeProjectFile(tempDir, 'docs/guide.md', '## `Guide` [Docs](./index.md)\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'docs/index.md'),
      root: tempDir,
      direction: 'both',
    });
    const treeOutput = formatRelatedFilesTree(result);
    const summaryOutput = formatRelatedFilesSummary(result);

    expect(treeOutput).toContain(
      'Related files for docs/index.md - Docs Index (2 lines, 35 chars, ~9 tokens)'
    );
    expect(treeOutput).toContain('docs/guide.md (1 line, 30 chars, ~8 tokens)');
    expect(treeOutput).toContain('title: Guide Docs');
    expect(treeOutput).toContain('link source: docs/index.md:2 "Guide"');
    expect(treeOutput).toContain(
      'docs/index.md (2 lines, 35 chars, ~9 tokens) (cycle)'
    );
    expect(treeOutput).toContain('link source: docs/guide.md:1 "Docs"');
    expect(treeOutput).toContain('\n\nsummary\n');
    expect(treeOutput).toContain('files shown: 2 files');
    expect(treeOutput).toContain('related files: 1 file');
    expect(treeOutput).toContain('total lines: 3 lines');
    expect(treeOutput).toContain('total chars: 65 chars');
    expect(treeOutput).toContain('estimated tokens: ~17 tokens');
    expect(treeOutput).toContain('median lines per file: 2 lines');
    expect(treeOutput).toContain('median chars per file: 33 chars');
    expect(treeOutput).toContain('max line length: 29 chars');
    expect(treeOutput).toContain('max relationship depth: 1');
    expect(treeOutput).toContain('largest files by chars');
    expect(treeOutput).toContain('docs/index.md (2 lines, 35 chars, ~9 tokens)');
    expect(treeOutput).toContain('docs/guide.md (1 line, 30 chars, ~8 tokens)');
    expect(summaryOutput).toContain('docs/guide.md - Guide Docs (1 line, 30 chars, ~8 tokens)');
  });

  it('supports root-relative markdown links and reports unresolved local markdown links', () => {
    writeProjectFile(
      tempDir,
      'docs/index.md',
      '[Guide](/docs/guide.md)\n[Missing](./missing.md)\n'
    );
    writeProjectFile(tempDir, 'docs/guide.md', '# Guide\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'docs/index.md'),
      root: tempDir,
      direction: 'imports',
    });
    const output = formatRelatedFilesTree(result);

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['docs/guide.md']);
    expect(result.unresolved).toEqual([
      {
        file: path.join(tempDir, 'docs/index.md'),
        specifier: './missing.md',
        metadata: [{ text: 'Missing', line: 2 }],
      },
    ]);
    expect(output).toContain('unresolved local links (1)');
    expect(output).toContain('docs/index.md (2 lines, 48 chars, ~12 tokens) -> ./missing.md');
    expect(output).toContain('link source: docs/index.md:2 "Missing"');
  });

  it('ignores markdown links inside inline code and fenced code blocks', () => {
    writeProjectFile(
      tempDir,
      'docs/index.md',
      [
        'Use `[Guide](./missing-inline.md)` as an example.',
        '',
        '```md',
        '[Guide](./missing-fenced.md)',
        '```',
        '',
        '[Real](./real.md)',
      ].join('\n')
    );
    writeProjectFile(tempDir, 'docs/real.md', '# Real\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'docs/index.md'),
      root: tempDir,
      direction: 'imports',
    });

    expect(toProjectPaths(tempDir, result.imports)).toEqual(['docs/real.md']);
    expect(result.unresolved).toEqual([]);
  });

  it('renders markdown summary labels as links instead of imports', () => {
    writeProjectFile(tempDir, 'docs/index.md', '[Guide](./guide.md)\n');
    writeProjectFile(tempDir, 'docs/guide.md', '# Guide\n');

    const result = getRelatedFiles({
      file: path.join(tempDir, 'docs/index.md'),
      root: tempDir,
      direction: 'both',
      maxDepth: 1,
    });
    const output = formatRelatedFilesSummary(result);

    expect(output).toContain('Outgoing links');
    expect(output).toContain('direct links (1)');
    expect(output).toContain('Incoming links');
    expect(output).toContain('direct linked by (0)');
    expect(output).not.toContain('direct imports');
  });

  it('respects default ignores, custom ignores, and gitignore rules while scanning', () => {
    writeProjectFile(tempDir, 'node_modules/pkg/index.ts', 'export const ignored = true;\n');
    writeProjectFile(tempDir, 'src/generated/ignored.ts', 'export const ignored = true;\n');
    writeProjectFile(tempDir, 'src/manual/ignored.ts', 'export const ignored = true;\n');
    writeProjectFile(tempDir, 'src/visible.ts', 'export const visible = true;\n');
    writeProjectFile(tempDir, '.gitignore', 'src/generated/**\n');

    const graph = buildDependencyGraph({ root: tempDir, ignore: 'src/manual' });
    const files = graph.files.map(file => path.relative(tempDir, file).split(path.sep).join('/'));

    expect(files).toEqual(['src/visible.ts']);
  });

  it('throws for invalid traversal depth, unsupported files, and files outside the root', () => {
    writeProjectFile(tempDir, 'src/entry.ts', 'export const entry = true;\n');
    writeProjectFile(tempDir, 'src/styles.css', 'body {}\n');

    expect(() =>
      getRelatedFiles({
        file: path.join(tempDir, 'src/entry.ts'),
        root: tempDir,
        maxDepth: 0,
      })
    ).toThrow('maxDepth must be a positive number');

    expect(() =>
      getRelatedFiles({
        file: path.join(tempDir, 'src/styles.css'),
        root: tempDir,
      })
    ).toThrow('unsupported, ignored, or not found');

    expect(() =>
      getRelatedFiles({
        file: path.join(os.tmpdir(), 'outside.ts'),
        root: tempDir,
      })
    ).toThrow('inside the project root');
  });
});
