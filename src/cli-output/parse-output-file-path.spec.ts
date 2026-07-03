import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { DEFAULT_OUTPUT_FILE_NAME, parseOutputFilePath } from '.';

const CWD = path.join(path.sep, 'workspace', 'project');

describe('parseOutputFilePath', () => {
  it('returns undefined when no output option is provided', () => {
    const result = parseOutputFilePath({
      output: undefined,
      exportPath: undefined,
      cwd: CWD,
    });

    expect(result).toBeUndefined();
  });

  it('uses the current directory and default file name when --output has no path', () => {
    const result = parseOutputFilePath({
      output: true,
      exportPath: undefined,
      cwd: CWD,
    });

    expect(result).toBe(path.join(CWD, DEFAULT_OUTPUT_FILE_NAME));
  });

  it('resolves a relative --output path to an absolute path', () => {
    const result = parseOutputFilePath({
      output: 'reports/tree.txt',
      exportPath: undefined,
      cwd: CWD,
    });

    expect(result).toBe(path.join(CWD, 'reports', 'tree.txt'));
  });

  it('keeps --export as a legacy alias with the same default behavior', () => {
    const result = parseOutputFilePath({
      output: undefined,
      exportPath: true,
      cwd: CWD,
    });

    expect(result).toBe(path.join(CWD, DEFAULT_OUTPUT_FILE_NAME));
  });

  it('rejects ambiguous output flags', () => {
    expect(() =>
      parseOutputFilePath({
        output: true,
        exportPath: 'tree.txt',
        cwd: CWD,
      })
    ).toThrow('Use either --output or --export, not both.');
  });

  it('rejects invalid non-string output values', () => {
    expect(() =>
      parseOutputFilePath({
        output: 123,
        exportPath: undefined,
        cwd: CWD,
      })
    ).toThrow('Invalid --output value.');
  });
});
