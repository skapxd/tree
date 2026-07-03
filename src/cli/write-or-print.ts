import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import path from 'node:path';
import { appendOutputContextSummary } from '@/shared/output-context';
import { printCliError } from './print-cli-error';

export function writeOrPrint(output: string, outputPath: string | undefined, color = false): void {
  const outputWithContextSummary = appendOutputContextSummary(output, { color });
  const shouldPrint = outputPath === undefined;
  if (shouldPrint) {
    console.log(outputWithContextSummary);
    return;
  }

  const absoluteOutputPath = path.resolve(outputPath);
  const writeResult = trySafe(() => fs.writeFileSync(absoluteOutputPath, outputWithContextSummary));
  if (Result.isErr(writeResult)) {
    printCliError(writeResult.error);
    process.exit(1);
  }

  console.log(`Output written to ${absoluteOutputPath}`);
}
