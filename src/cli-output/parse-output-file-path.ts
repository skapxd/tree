import { resolveOutputOptionValue } from './resolve-output-option-value';

type OutputFilePathOptions = {
  output: unknown;
  exportPath: unknown;
  cwd: string;
};

export function parseOutputFilePath(options: OutputFilePathOptions): string | undefined {
  const outputPath = resolveOutputOptionValue(options.output, '--output', options.cwd);
  const legacyExportPath = resolveOutputOptionValue(options.exportPath, '--export', options.cwd);
  const hasConflictingOutputOptions = outputPath !== undefined && legacyExportPath !== undefined;
  if (hasConflictingOutputOptions) {
    throw new Error('Use either --output or --export, not both.');
  }

  return outputPath ?? legacyExportPath;
}
