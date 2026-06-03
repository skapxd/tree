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
      expect(children).toContain('a.txt (1 line)');
      expect(children).toContain('d.txt (1 line)');
      expect(children).toContainEqual({ b: ['c.txt (1 line)'] });
    });

    it('should respect ignore option', () => {
      const ignoreRegex = parseIgnoreOption('b');
      const structure = dirToJson(tempDir, ignoreRegex);
      const rootKey = path.basename(tempDir);
      const children = (structure as any)[rootKey];
      
      expect(children).not.toContainEqual({ b: ['c.txt (1 line)'] });
      expect(children).toContain('a.txt (1 line)');
    });

    it('should generate a correct tree string', () => {
      const structure = dirToJson(tempDir, null);
      if (!structure) throw new Error('Structure failed');
      
      const treeString = generateTreeString(structure);
      const rootName = path.basename(tempDir);
      
      expect(treeString).toContain(rootName);
      expect(treeString).toContain('├── a.txt');
      expect(treeString).toContain('(1 line)');
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
      expect(result).toContain('(0 lines)');
      expect(result).toContain('two-lines.txt');
      expect(result).toContain('(2 lines)');
      expect(result).toContain('trailing-newline.txt');
    });

    it('should dim line count metadata when color output is enabled', () => {
      fs.writeFileSync(path.join(tempDir, 'short.ts'), 'one\ntwo');

      const result = tree({ directory: tempDir, color: true });

      expect(result).toBeTypeOf('string');
      expect(result).toContain('short.ts \x1b[2m(2 lines)\x1b[0m');
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
