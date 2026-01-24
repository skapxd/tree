import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { parseIgnoreOption, sortDir } from './utils';
import { dirToJson } from './parser';
import { generateTreeString } from './drawer';

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
      expect(children).toContain('a.txt');
      expect(children).toContain('d.txt');
      expect(children).toContainEqual({ b: ['c.txt'] });
    });

    it('should respect ignore option', () => {
      const ignoreRegex = parseIgnoreOption('b');
      const structure = dirToJson(tempDir, ignoreRegex);
      const rootKey = path.basename(tempDir);
      const children = (structure as any)[rootKey];
      
      expect(children).not.toContainEqual({ b: ['c.txt'] });
      expect(children).toContain('a.txt');
    });

    it('should generate a correct tree string', () => {
      const structure = dirToJson(tempDir, null);
      if (!structure) throw new Error('Structure failed');
      
      const treeString = generateTreeString(structure);
      const rootName = path.basename(tempDir);
      
      expect(treeString).toContain(rootName);
      expect(treeString).toContain('├── a.txt');
      expect(treeString).toContain('├── d.txt');
      expect(treeString).toContain('└── b');
      expect(treeString).toContain('    └── c.txt');
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
});
