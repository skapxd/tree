import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

type CliRunResult = {
  exitCode: number;
  stderr: string;
  stdout: string;
};

const REPO_ROOT = path.resolve(__dirname, '../..');
const CLI_PATH = path.join(REPO_ROOT, 'dist', 'cli.cjs');
const PACKAGE_JSON_PATH = path.join(REPO_ROOT, 'package.json');

function runCli(args: string[], cwd = REPO_ROOT): Promise<CliRunResult> {
  return new Promise(resolve => {
    execFile(
      process.execPath,
      [CLI_PATH, ...args],
      {
        cwd,
        env: {
          ...process.env,
          NO_COLOR: '1',
        },
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        const code = error?.code;
        const exitCode = typeof code === 'number' ? code : error === null ? 0 : 1;

        resolve({
          exitCode,
          stderr: stderr.toString(),
          stdout: stdout.toString(),
        });
      }
    );
  });
}

function writeProjectFile(root: string, relativePath: string, content: string): string {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return filePath;
}

function readPackageVersion(): string {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8')) as {
    version?: unknown;
  };

  return typeof packageJson.version === 'string' ? packageJson.version : '';
}

describe('tree CLI contract', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tree-cli-e2e-'));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('prints the package version from the built binary', async () => {
    const result = await runCli(['--version']);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe(readPackageVersion());
  });

  it('prints a file outline for a TypeScript file', async () => {
    const filePath = writeProjectFile(
      tempDir,
      'src/example.ts',
      "export function run(): string {\n  return helper();\n}\n\nfunction helper(): string {\n  return 'ok';\n}\n"
    );

    const result = await runCli([filePath]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('func');
    expect(result.stdout).toContain('run');
    expect(result.stdout).toContain('helper');
    expect(result.stdout).toContain('output context');
  });

  it('writes output to a file when --output is provided', async () => {
    const filePath = writeProjectFile(
      tempDir,
      'src/example.ts',
      'export const value = 1;\n'
    );
    const outputPath = path.join(tempDir, 'tree-output.txt');

    const result = await runCli([filePath, '--output', outputPath]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain(`Output written to ${outputPath}`);
    expect(fs.readFileSync(outputPath, 'utf-8')).toContain('value');
  });

  it('prints related imports for a file with --related', async () => {
    const entryPath = writeProjectFile(
      tempDir,
      'src/entry.ts',
      "import { value } from './util';\nexport const entry = value;\n"
    );
    writeProjectFile(tempDir, 'src/util.ts', 'export const value = 1;\n');

    const result = await runCli([
      entryPath,
      '--related',
      'imports',
      '--root',
      tempDir,
      '--depth',
      '1',
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('Related files for src/entry.ts');
    expect(result.stdout).toContain('src/util.ts');
  });

  it('returns a failing exit code for a missing --related target', async () => {
    const missingPath = path.join(tempDir, 'src/missing.ts');

    const result = await runCli([
      missingPath,
      '--related',
      'imports',
      '--root',
      tempDir,
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('Error:');
    expect(result.stderr).toContain('missing.ts');
  });
});
