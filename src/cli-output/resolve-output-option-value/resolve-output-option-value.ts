import path from 'node:path';
import { DEFAULT_OUTPUT_FILE_NAME } from '@/cli-output/constants';

export function resolveOutputOptionValue(
  value: unknown,
  flagName: '--output' | '--export',
  cwd: string
): string | undefined {
  const isMissingOption = value === undefined || value === false;
  if (isMissingOption) return undefined;

  const usesDefaultOutputFile = value === true;
  if (usesDefaultOutputFile) return path.join(cwd, DEFAULT_OUTPUT_FILE_NAME);

  const hasStringOutputPath = typeof value === 'string';
  if (!hasStringOutputPath) {
    throw new Error(`Invalid ${flagName} value.`);
  }

  const usesDefaultOutputFileName = value.trim().length === 0;
  if (usesDefaultOutputFileName) return path.join(cwd, DEFAULT_OUTPUT_FILE_NAME);

  return path.resolve(cwd, value);
}
