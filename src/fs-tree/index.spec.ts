import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { parseIgnoreOption, sortDir } from './utils';
import { dirToJson } from './parser';
import { generateTreeString } from './drawer';
import { tree } from './index';
import { getGitIgnoreRegex } from './gitignore';

describe('fs-tree module', () => {
  describe('utils: parseIgnoreOption', () => {
    it('should return null if no ignore string is provided', () => {
      expect(parseIgnoreOption()).toBeNull();
      expect(parseIgnoreOption('')).toBeNull();
    });

    it('should parse simple strings into regex', () => {
      const regex = parseIgnoreOption('node_modules');
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex?.test('node_modules')).toBe(true);
      expect(regex?.test('src')).toBe(false);
    });

    it('should handle regex-like strings with slashes', () => {
      const regex = parseIgnoreOption('/\.git/');
      expect(regex?.test('.git')).toBe(true);
    });
  });

  describe('utils: sortDir', () => {
    it('should put objects (directories) at the end', () => {
      const input = [
        { folder: [] },
        'file1.ts',
        'file2.ts',
        { another: [] }
      ];
      const result = sortDir([...input]);
      expect(result[result.length - 1]).toEqual({ folder: [] });
      expect(result[result.length - 2]).toEqual({ another: [] });
      expect(typeof result[0]).toBe('string');
      expect(typeof result[1]).toBe('string');
    });
  });

  describe('parser and drawer integration', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tree-test-'));
      // Create a dummy structure
      // tempDir/
      // ├── a.txt
      // ├── b/
      // │   └── c.txt
      // └── d.txt
      fs.writeFileSync(path.join(tempDir, 'a.txt'), 'hello');
      fs.writeFileSync(path.join(tempDir, 'd.txt'), 'world');
      fs.mkdirSync(path.join(tempDir, 'b'));
      fs.writeFileSync(path.join(tempDir, 'b', 'c.txt'), 'nested');
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should correctly parse a directory structure to JSON', () => {
      const structure = dirToJson(tempDir, null);
      expect(structure).toBeDefined();
      const rootKey = path.basename(tempDir);
      expect(structure).toHaveProperty(rootKey);
      
      const children = (structure as any)[rootKey];
      expect(children).toContain('a.txt (1 line, 5 chars, ~2 tokens)');
      expect(children).toContain('d.txt (1 line, 5 chars, ~2 tokens)');
      expect(children).toContainEqual({ b: ['c.txt (1 line, 6 chars, ~2 tokens)'] });
    });

    it('should respect ignore option', () => {
      const ignoreRegex = parseIgnoreOption('b');
      const structure = dirToJson(tempDir, ignoreRegex);
      const rootKey = path.basename(tempDir);
      const children = (structure as any)[rootKey];
      
      expect(children).not.toContainEqual({ b: ['c.txt (1 line, 6 chars, ~2 tokens)'] });
      expect(children).toContain('a.txt (1 line, 5 chars, ~2 tokens)');
    });

    it('should generate a correct tree string', () => {
      const structure = dirToJson(tempDir, null);
      if (!structure) throw new Error('Structure failed');
      
      const treeString = generateTreeString(structure);
      const rootName = path.basename(tempDir);
      
      expect(treeString).toContain(rootName);
      expect(treeString).toContain('├── a.txt');
      expect(treeString).toContain('(1 line, 5 chars, ~2 tokens)');
      expect(treeString).toContain('└── b/');
      expect(treeString).toContain('    └── c.txt');
    });

    it('should include line counts for empty, trailing-newline, and non-trailing-newline files', () => {
      fs.writeFileSync(path.join(tempDir, 'empty.txt'), '');
      fs.writeFileSync(path.join(tempDir, 'two-lines.txt'), 'one\ntwo');
      fs.writeFileSync(path.join(tempDir, 'trailing-newline.txt'), 'one\ntwo\n');

      const result = tree({ directory: tempDir });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('empty.txt');
      expect(result).toContain('(0 lines, 0 chars, ~0 tokens)');
      expect(result).toContain('two-lines.txt');
      expect(result).toContain('(2 lines, 7 chars, ~2 tokens)');
      expect(result).toContain('trailing-newline.txt');
    });

    it('should append a compact directory summary when requested', () => {
      fs.writeFileSync(path.join(tempDir, 'two-lines.ts'), 'one\ntwo');
      fs.writeFileSync(path.join(tempDir, 'README.md'), 'title\nbody\nend');

      const result = tree({ directory: tempDir, includeSummary: true });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('\n\nsummary\n');
      expect(result).toContain('directories: 1');
      expect(result).toContain('files: 5');
      expect(result).toContain('total lines: 8 lines');
      expect(result).toContain('total chars: 37 chars');
      expect(result).toContain('estimated tokens: ~10 tokens');
      expect(result).toContain('median lines per file: 1 line');
      expect(result).toContain('median chars per file: 6 chars');
      expect(result).toContain('max line length: 6 chars');
      expect(result).toContain('largest files by chars');
      expect(result).toContain('README.md (3 lines, 14 chars, ~4 tokens)');
      expect(result).toContain('two-lines.ts (2 lines, 7 chars, ~2 tokens)');
      expect(result).toContain('top extensions');
      expect(result).toContain('.txt: 3 files');
      expect(result).toContain('.md: 1 file');
      expect(result).toContain('.ts: 1 file');
    });

    it('should round the median line count for an even number of files', () => {
      fs.rmSync(path.join(tempDir, 'b'), { recursive: true, force: true });
      fs.rmSync(path.join(tempDir, 'a.txt'));
      fs.rmSync(path.join(tempDir, 'd.txt'));
      fs.writeFileSync(path.join(tempDir, 'one.ts'), 'one');
      fs.writeFileSync(path.join(tempDir, 'four.ts'), 'one\ntwo\nthree\nfour');

      const result = tree({ directory: tempDir, includeSummary: true });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('median lines per file: 3 lines');
    });

    it('should keep the five largest files in the directory summary', () => {
      fs.rmSync(path.join(tempDir, 'b'), { recursive: true, force: true });
      fs.rmSync(path.join(tempDir, 'a.txt'));
      fs.rmSync(path.join(tempDir, 'd.txt'));
      fs.writeFileSync(path.join(tempDir, 'one.ts'), 'one');
      fs.writeFileSync(path.join(tempDir, 'two.ts'), 'one\ntwo');
      fs.writeFileSync(path.join(tempDir, 'three.ts'), 'one\ntwo\nthree');
      fs.writeFileSync(path.join(tempDir, 'four.ts'), 'one\ntwo\nthree\nfour');
      fs.writeFileSync(path.join(tempDir, 'five.ts'), 'one\ntwo\nthree\nfour\nfive');
      fs.writeFileSync(path.join(tempDir, 'six.ts'), 'one\ntwo\nthree\nfour\nfive\nsix');
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), 'one\ntwo\nthree\nfour\nfive\nsix\nseven');
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), 'one\ntwo\nthree\nfour\nfive\nsix');

      const result = tree({ directory: tempDir, includeSummary: true });

      expect(result).toBeTypeOf('string');
      if (result === null) throw new Error('Expected tree result');

      const largestFilesStart = result.indexOf('├── largest files by chars');
      const topExtensionsStart = result.indexOf('└── top extensions');
      const largestFilesSection = result.slice(largestFilesStart, topExtensionsStart);
      const largestFileRows = largestFilesSection
        .split('\n')
        .filter(line => line.startsWith('│   '));

      expect(largestFileRows).toHaveLength(5);
      expect(largestFilesSection).toContain('six.ts (6 lines, 27 chars, ~7 tokens)');
      expect(largestFilesSection).toContain('five.ts (5 lines, 23 chars, ~6 tokens)');
      expect(largestFilesSection).toContain('four.ts (4 lines, 18 chars, ~5 tokens)');
      expect(largestFilesSection).toContain('three.ts (3 lines, 13 chars, ~4 tokens)');
      expect(largestFilesSection).toContain('two.ts (2 lines, 7 chars, ~2 tokens)');
      expect(largestFilesSection).not.toContain('one.ts (1 line, 3 chars, ~1 token)');
      expect(result).toContain('yarn.lock (7 lines, 33 chars, ~9 tokens)');
      expect(result).toContain('package-lock.json (6 lines, 27 chars, ~7 tokens)');
      expect(largestFilesSection).not.toContain('yarn.lock');
      expect(largestFilesSection).not.toContain('package-lock.json');
    });

    it('should not count file lines in the summary when only folders are requested', () => {
      const result = tree({ directory: tempDir, onlyFolder: true, includeSummary: true });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('\n\nsummary\n');
      expect(result).toContain('directories: 1');
      expect(result).toContain('files and text stats: skipped (--only-folder)');
      expect(result).not.toContain('total lines:');
    });

    it('should dim line count metadata when color output is enabled', () => {
      fs.writeFileSync(path.join(tempDir, 'short.ts'), 'one\ntwo');

      const result = tree({ directory: tempDir, color: true });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('short.ts \x1b[2m(2 lines, 7 chars, ~2 tokens)\x1b[0m');
    });

    it('should handle onlyFolder option', () => {
      const structure = dirToJson(tempDir, null, true);
      const rootKey = path.basename(tempDir);
      const children = (structure as any)[rootKey];

      expect(children).toContainEqual({ b: [] });
      expect(children).not.toContain('a.txt');
      expect(children).not.toContain('d.txt');
    });
  });

  describe('tree() function', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tree-fn-test-'));
      fs.writeFileSync(path.join(tempDir, 'a.txt'), 'hello');
      fs.writeFileSync(path.join(tempDir, 'd.txt'), 'world');
      fs.mkdirSync(path.join(tempDir, 'b'));
      fs.writeFileSync(path.join(tempDir, 'b', 'c.txt'), 'nested');
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should return a tree string for a valid directory', () => {
      const result = tree({ directory: tempDir });
      expect(result).toBeTypeOf('string');
      expect(result).toContain('a.txt');
      expect(result).toContain('d.txt');
      expect(result).toContain('b/');
    });

    it('should return null for a non-existent directory', () => {
      const result = tree({ directory: path.join(tempDir, 'no-existe') });
      expect(result).toBeNull();
    });

    it('should filter with RegExp ignore option', () => {
      const result = tree({ directory: tempDir, ignore: /b/ });
      expect(result).toBeTypeOf('string');
      expect(result).not.toContain('b/');
      expect(result).toContain('a.txt');
    });

    it('should filter with string ignore option', () => {
      const result = tree({ directory: tempDir, ignore: 'b' });
      expect(result).toBeTypeOf('string');
      expect(result).not.toContain('b/');
      expect(result).toContain('a.txt');
    });

    it('should show only folders with onlyFolder option', () => {
      const result = tree({ directory: tempDir, onlyFolder: true });
      expect(result).toBeTypeOf('string');
      expect(result).toContain('b/');
      expect(result).not.toContain('a.txt');
      expect(result).not.toContain('d.txt');
    });

    it('should respect .gitignore negation patterns', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), '*.log\n!important.log\n');
      fs.writeFileSync(path.join(tempDir, 'ignored.log'), 'ignore me');
      fs.writeFileSync(path.join(tempDir, 'important.log'), 'keep me');

      const result = tree({ directory: tempDir });

      expect(result).toBeTypeOf('string');
      expect(result).not.toContain('ignored.log');
      expect(result).toContain('important.log');
    });

    it('should respect path-aware .gitignore patterns', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), 'src/generated/**\n');
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.mkdirSync(path.join(tempDir, 'src', 'generated'));
      fs.mkdirSync(path.join(tempDir, 'generated'));
      fs.writeFileSync(path.join(tempDir, 'src', 'generated', 'ignored.ts'), 'ignore me');
      fs.writeFileSync(path.join(tempDir, 'generated', 'visible.ts'), 'keep me');

      const result = tree({ directory: tempDir });

      expect(result).toBeTypeOf('string');
      expect(result).not.toContain('ignored.ts');
      expect(result).toContain('visible.ts');
    });

    it('should scope nested .gitignore files to their own directory', () => {
      fs.mkdirSync(path.join(tempDir, 'src'));
      fs.writeFileSync(path.join(tempDir, 'src', '.gitignore'), '*.tmp\n!keep.tmp\n');
      fs.writeFileSync(path.join(tempDir, 'root.tmp'), 'keep me');
      fs.writeFileSync(path.join(tempDir, 'src', 'ignored.tmp'), 'ignore me');
      fs.writeFileSync(path.join(tempDir, 'src', 'keep.tmp'), 'keep me');

      const result = tree({ directory: tempDir });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('root.tmp');
      expect(result).not.toContain('ignored.tmp');
      expect(result).toContain('keep.tmp');
    });
  });

  describe('getGitIgnoreRegex()', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitignore-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should return regex with defaults when no .gitignore exists', () => {
      const regex = getGitIgnoreRegex(tempDir);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex!.test('.git')).toBe(true);
      expect(regex!.test('.DS_Store')).toBe(true);
    });

    it('should return null when no .gitignore and defaults disabled', () => {
      const regex = getGitIgnoreRegex(tempDir, false);
      expect(regex).toBeNull();
    });

    it('should parse simple patterns from .gitignore', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), 'node_modules\ndist\n');
      const regex = getGitIgnoreRegex(tempDir);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex!.test('node_modules')).toBe(true);
      expect(regex!.test('dist')).toBe(true);
      expect(regex!.test('src')).toBe(false);
    });

    it('should handle wildcard patterns', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), '*.log\n');
      const regex = getGitIgnoreRegex(tempDir);
      expect(regex!.test('error.log')).toBe(true);
      expect(regex!.test('debug.log')).toBe(true);
      expect(regex!.test('file.txt')).toBe(false);
    });

    it('should ignore comments and empty lines', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), '# comment\n\nnode_modules\n\n# another\n');
      const regex = getGitIgnoreRegex(tempDir, false);
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex!.test('node_modules')).toBe(true);
      expect(regex!.test('# comment')).toBe(false);
    });

    it('should handle trailing slash patterns', () => {
      fs.writeFileSync(path.join(tempDir, '.gitignore'), 'dist/\nbuild/\n');
      const regex = getGitIgnoreRegex(tempDir, false);
      expect(regex!.test('dist')).toBe(true);
      expect(regex!.test('build')).toBe(true);
    });
  });
});
