import { parseOutputFilePath } from '@/cli-output';
import { getStringOption } from './get-string-option';
import { isRecord } from './is-record';
import { type CliOptions } from './types';

export function parseCliOptions(value: unknown): CliOptions {
  const rawOptions = isRecord(value) ? value : {};

  return {
    depth: rawOptions.depth,
    directory: getStringOption(rawOptions.directory),
    ignore: getStringOption(rawOptions.ignore),
    onlyFolder: rawOptions.onlyFolder === true,
    outputPath: parseOutputFilePath({
      output: rawOptions.output,
      exportPath: rawOptions.export,
      cwd: process.cwd(),
    }),
    related: rawOptions.related,
    root: getStringOption(rawOptions.root),
    summary: rawOptions.summary === true,
    tree: rawOptions.tree === true,
  };
}
