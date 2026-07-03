import { Result, trySafe } from '@skapxd/result';
import { getParser, readFile, formatSingleFileOutline } from '@/file-tree';
import { canColorOutput } from './can-color-output';
import { createRelatedOutput } from './create-related-output';
import { hasRelatedOption } from './has-related-option';
import { printCliError } from './print-cli-error';
import { type CliOptions } from './types';
import { writeOrPrint } from './write-or-print';

export function handleFileTarget(targetPath: string, options: CliOptions): void {
  const result = trySafe(() => {
    const hasRelatedMode = hasRelatedOption(options.related);
    if (hasRelatedMode) {
      const output = createRelatedOutput(targetPath, options);
      writeOrPrint(output, options.outputPath, canColorOutput(options.outputPath));
      return;
    }

    const content = readFile(targetPath);
    const parser = getParser(targetPath);
    const { lines, sections } = parser.parse(content);
    const output = formatSingleFileOutline(targetPath, lines, sections);
    writeOrPrint(output, options.outputPath, canColorOutput(options.outputPath));
  });

  if (Result.isErr(result)) {
    printCliError(result.error);
    process.exit(1);
  }
}
