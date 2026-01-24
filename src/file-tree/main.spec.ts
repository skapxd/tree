import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getParser, findSection, readFile, buildTreeFromSections, showSingleFileOutline } from './index';
import { markdownParser } from './parsers/md';
import { tsxParser } from './parsers/tsx';

describe('file-tree module', () => {
  describe('getParser', () => {
    it('should return markdownParser for .md files', () => {
      expect(getParser('test.md')).toBe(markdownParser);
    });

    it('should return tsxParser for .ts and .tsx files', () => {
      expect(getParser('test.ts')).toBe(tsxParser);
      expect(getParser('test.tsx')).toBe(tsxParser);
    });

    it('should fallback to markdownParser for unknown extensions', () => {
      expect(getParser('test.unknown')).toBe(markdownParser);
    });
  });

  describe('findSection', () => {
    const sections = [
      { level: 1, title: 'Intro', startLine: 1, endLine: 5, fullHeading: '# Intro' },
      { level: 2, title: 'Details', startLine: 6, endLine: 10, fullHeading: '## Details' },
    ];

    it('should find section by title', () => {
      const result = findSection(sections, 'Intro');
      expect(result).toBe(sections[0]);
    });

    it('should find section by fullHeading', () => {
      const result = findSection(sections, '## Details');
      expect(result).toBe(sections[1]);
    });

    it('should be case insensitive', () => {
      const result = findSection(sections, 'details');
      expect(result).toBe(sections[1]);
    });

    it('should return undefined if not found', () => {
      expect(findSection(sections, 'None')).toBeUndefined();
    });
  });

  describe('utils: readFile', () => {
    it('should read file content', () => {
      // We can use an actual file from the project
      const content = readFile(path.join(__dirname, 'index.ts'));
      expect(content).toContain('import path from \'path\';');
    });

    it('should throw error if file not found', () => {
      expect(() => readFile('non-existent.file')).toThrow('File not found');
    });
  });

  describe('utils: buildTreeFromSections', () => {
    it('should build a hierarchy', () => {
      const sections = [
        { level: 1, title: 'H1', startLine: 1, endLine: 10, fullHeading: '# H1' },
        { level: 2, title: 'H2', startLine: 2, endLine: 5, fullHeading: '## H2' },
        { level: 1, title: 'H1-2', startLine: 11, endLine: 20, fullHeading: '# H1-2' },
      ];
      const tree = buildTreeFromSections(sections);
      expect(tree).toHaveLength(2);
      expect(tree[0].children).toHaveLength(1);
      expect(tree[0].section.title).toBe('H1');
      expect(tree[0].children[0].section.title).toBe('H2');
      expect(tree[1].section.title).toBe('H1-2');
    });
  });

  describe('drawer: showSingleFileOutline', () => {
    it('should log the outline', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const sections = [
        { level: 1, title: 'H1', startLine: 1, endLine: 10, fullHeading: '# H1', kind: 'heading' },
      ];
      showSingleFileOutline('test.md', ['# H1'], sections);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log empty message if no sections', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      showSingleFileOutline('empty.md', [], []);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No structural elements found'));
      consoleSpy.mockRestore();
    });
  });
});
