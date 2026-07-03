import { tree } from '@/fs-tree';
import { canColorOutput } from './can-color-output';
import { hasRelatedOption } from './has-related-option';
import { type CliOptions } from './types';
import { writeOrPrint } from './write-or-print';

export function handleDirectoryTarget(targetPath: string, options: CliOptions): void {
  const hasRelatedMode = hasRelatedOption(options.related);
  if (hasRelatedMode) {
    console.error('Error: --related requires a file path, not a directory.');
    process.exit(1);
  }

  const output = tree({
    directory: targetPath,
    ...(options.ignore === undefined ? {} : { ignore: options.ignore }),
    onlyFolder: options.onlyFolder,
    color: canColorOutput(options.outputPath),
    includeSummary: true,
  });
  const lacksDirectoryOutput = output === null;

  if (lacksDirectoryOutput) {
    console.error(`Error: Could not read directory "${targetPath}"`);
    process.exit(1);
  }

  writeOrPrint(output, options.outputPath, canColorOutput(options.outputPath));
}
