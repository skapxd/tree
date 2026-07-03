#!/usr/bin/env node

import { Result, trySafe } from '@skapxd/result';
import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { getTargetPath } from './cli/get-target-path';
import { handleDirectoryTarget } from './cli/handle-directory-target';
import { handleFileTarget } from './cli/handle-file-target';
import { hasConflictingOutputOptions } from './cli/has-conflicting-output-options';
import { hasRelatedOption } from './cli/has-related-option';
import { parseCliOptions } from './cli/parse-cli-options';
import { printCliError } from './cli/print-cli-error';
import { readPackageVersion } from './cli/read-package-version';
import { absorbRecoverableBoundaryError } from './shared/safety';

const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');

program
  .name('tree')
  .description('Powerful project structure visualizer: generates directory trees or file outlines.')
  .version(readPackageVersion(PACKAGE_JSON_PATH))
  .argument('[path]', 'Directory or File path to analyze')
  .option('-d, --directory <dir>', 'Specify a path (alternative to positional argument)')
  .option('-i, --ignore [ig]', 'Literal pattern to ignore. Use | for alternatives.')
  .option('-o, --output [path]', 'Write result to a file. Defaults to ./tree-output.txt.')
  .option('-e, --export [epath]', 'Legacy alias for --output')
  .option('-f, --only-folder', 'Output folders only (only for directories)')
  .option('-r, --related [mode]', 'Show related files for a file using imports. Modes: imports, importers, both.')
  .option('--root <dir>', 'Project root for --related scans. Defaults to the current directory.')
  .option('--depth <depth>', 'Max traversal depth for --related. Use "all" for the full graph.', 'all')
  .option('--summary', 'Use the layered related-file summary instead of the full nested tree.')
  .option('--tree', 'Use the full nested related-file tree. This is the default for --related.')
  .action((dirArg: unknown, rawOptions: unknown) => {
    const hasConflictingOutputOptionsSelected = hasConflictingOutputOptions(rawOptions);
    if (hasConflictingOutputOptionsSelected) {
      printCliError(new Error('Use either --output or --export, not both.'));
      process.exit(1);
    }

    const options = parseCliOptions(rawOptions);
    const targetPath = getTargetPath(dirArg, options);
    const statsResult = trySafe(() => fs.lstatSync(targetPath));
    const hasRelatedMode = hasRelatedOption(options.related);
    const hasMissingRelatedTarget = Result.isErr(statsResult) && hasRelatedMode;

    if (hasMissingRelatedTarget) {
      printCliError(statsResult.error);
      process.exit(1);
    }

    if (Result.isErr(statsResult)) {
      absorbRecoverableBoundaryError(statsResult.error);
      handleDirectoryTarget(targetPath, options);
      return;
    }

    const isFileTarget = statsResult.value.isFile();
    const isSymbolicLinkTarget = statsResult.value.isSymbolicLink();
    const shouldHandleAsRelatedTarget =
      hasRelatedMode && (isFileTarget || isSymbolicLinkTarget);
    if (shouldHandleAsRelatedTarget) {
      handleFileTarget(targetPath, options);
      return;
    }

    if (isFileTarget) {
      handleFileTarget(targetPath, options);
      return;
    }

    handleDirectoryTarget(targetPath, options);
  });

program.parse(process.argv);
