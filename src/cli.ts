#!/usr/bin/env node

import { Result, trySafe } from '@skapxd/result';
import { program } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { getParser, readFile, formatSingleFileOutline } from './file-tree';
import { tree } from './fs-tree';
import { appendOutputContextSummary } from './shared/output-context';
import {
  formatRelatedFilesSummary,
  formatRelatedFilesTree,
  getRelatedFiles,
  type RelatedFilesDirection,
} from './related-files';

type CliOptions = {
  depth: unknown;
  directory: string | undefined;
  exportPath: string | undefined;
  ignore: string | undefined;
  onlyFolder: boolean;
  related: unknown;
  root: string | undefined;
  summary: boolean;
  tree: boolean;
};

type PackageJson = {
  version: string;
};

const DEFAULT_VERSION = '0.0.0';
const DEFAULT_IGNORE_PATTERNS = ['^\\.git$', '^\\.DS_Store$'];
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');

const cli = {
  absorbRecoverableBoundaryError(error: unknown): void {
    void error;
  },

  createDirectoryIgnoreRegex(ignore: string | undefined): RegExp {
    const hasCustomIgnore = ignore !== undefined;
    const ignorePatterns = hasCustomIgnore
      ? [...DEFAULT_IGNORE_PATTERNS, ignore]
      : [...DEFAULT_IGNORE_PATTERNS];

    return new RegExp(ignorePatterns.join('|'));
  },

  canColorOutput(exportPath: string | undefined): boolean {
    return cli.shouldColorOutput() && exportPath === undefined;
  },

  createRelatedOutput(targetPath: string, options: CliOptions): string {
    const maxDepth = cli.parseRelatedDepth(options.depth);
    const relatedOptions = {
      file: targetPath,
      root: options.root ?? process.cwd(),
      direction: cli.parseRelatedDirection(options.related),
      ...(maxDepth === undefined ? {} : { maxDepth }),
      ...(options.ignore === undefined ? {} : { ignore: options.ignore }),
    };
    const relatedFiles = getRelatedFiles(relatedOptions);
    const formatOptions = {
      color: cli.canColorOutput(options.exportPath),
    };
    const shouldRenderSummary = options.summary && !options.tree;

    return shouldRenderSummary
      ? formatRelatedFilesSummary(relatedFiles, formatOptions)
      : formatRelatedFilesTree(relatedFiles, formatOptions);
  },

  getStringOption(value: unknown): string | undefined {
    const isStringOption = typeof value === 'string';
    return isStringOption ? value : undefined;
  },

  getTargetPath(dirArg: unknown, options: CliOptions): string {
    const positionalPath = cli.getStringOption(dirArg);
    return positionalPath ?? options.directory ?? process.cwd();
  },

  handleDirectoryTarget(targetPath: string, options: CliOptions): void {
    const hasRelatedMode = cli.hasRelatedOption(options.related);
    if (hasRelatedMode) {
      console.error('Error: --related requires a file path, not a directory.');
      process.exit(1);
    }

    const ignoreRegex = cli.createDirectoryIgnoreRegex(options.ignore);
    const output = tree({
      directory: targetPath,
      ignore: ignoreRegex,
      onlyFolder: options.onlyFolder,
      color: cli.canColorOutput(options.exportPath),
      includeSummary: true,
    });
    const lacksDirectoryOutput = output === null;

    if (lacksDirectoryOutput) {
      console.error(`Error: Could not read directory "${targetPath}"`);
      process.exit(1);
    }

    cli.writeOrPrint(output, undefined, cli.canColorOutput(options.exportPath));

    const shouldExport = options.exportPath !== undefined;
    if (!shouldExport) return;

    const exportOutput = tree({
      directory: targetPath,
      ignore: ignoreRegex,
      onlyFolder: options.onlyFolder,
      color: false,
      includeSummary: true,
    });
      cli.writeOrPrint(exportOutput ?? output, options.exportPath, false);
  },

  handleFileTarget(targetPath: string, options: CliOptions): void {
    const result = trySafe(() => {
      const hasRelatedMode = cli.hasRelatedOption(options.related);
      if (hasRelatedMode) {
        const output = cli.createRelatedOutput(targetPath, options);
        cli.writeOrPrint(output, options.exportPath, cli.canColorOutput(options.exportPath));
        return;
      }

      const content = readFile(targetPath);
      const parser = getParser(targetPath);
      const { lines, sections } = parser.parse(content);
      const output = formatSingleFileOutline(targetPath, lines, sections);
      cli.writeOrPrint(output, options.exportPath, cli.canColorOutput(options.exportPath));
    });

    if (Result.isErr(result)) {
      cli.printCliError(result.error);
      process.exit(1);
    }
  },

  hasRelatedOption(value: unknown): boolean {
    return value !== undefined && value !== false;
  },

  isPackageJson(value: unknown): value is PackageJson {
    const isPackageObject = cli.isRecord(value);
    if (!isPackageObject) return false;

    return typeof value.version === 'string';
  },

  isRecord(value: unknown): value is Record<string, unknown> {
    const isObject = typeof value === 'object';
    const isPresent = value !== null;
    const isArray = Array.isArray(value);
    return isObject && isPresent && !isArray;
  },

  parseCliOptions(value: unknown): CliOptions {
    const rawOptions = cli.isRecord(value) ? value : {};

    return {
      depth: rawOptions.depth,
      directory: cli.getStringOption(rawOptions.directory),
      exportPath: cli.getStringOption(rawOptions.export),
      ignore: cli.getStringOption(rawOptions.ignore),
      onlyFolder: rawOptions.onlyFolder === true,
      related: rawOptions.related,
      root: cli.getStringOption(rawOptions.root),
      summary: rawOptions.summary === true,
      tree: rawOptions.tree === true,
    };
  },

  parseRelatedDepth(value: unknown): number | undefined {
    const usesFullDepth = value === undefined || value === 'all';
    if (usesFullDepth) return undefined;

    const depth = Number(value);
    const isInvalidDepth = !Number.isInteger(depth) || depth < 1;
    if (isInvalidDepth) {
      throw new Error('Invalid --depth value. Use a positive integer or "all".');
    }

    return depth;
  },

  parseRelatedDirection(value: unknown): RelatedFilesDirection {
    const usesDefaultDirection = value === true || value === undefined;
    if (usesDefaultDirection) return 'both';

    const direction = String(value);
    const isValidDirection =
      direction === 'imports' || direction === 'importers' || direction === 'both';
    if (isValidDirection) return direction;

    throw new Error(`Invalid --related mode "${direction}". Use imports, importers, or both.`);
  },

  printCliError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
  },

  readPackageVersion(): string {
    const readResult = trySafe(() => fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    if (Result.isErr(readResult)) {
      cli.absorbRecoverableBoundaryError(readResult.error);
      return DEFAULT_VERSION;
    }

    const parseResult = trySafe((): unknown => JSON.parse(readResult.value));
    if (Result.isErr(parseResult)) {
      cli.absorbRecoverableBoundaryError(parseResult.error);
      return DEFAULT_VERSION;
    }

    const packageJson = parseResult.value;
    const hasPackageVersion = cli.isPackageJson(packageJson);
    return hasPackageVersion ? packageJson.version : DEFAULT_VERSION;
  },

  shouldColorOutput(): boolean {
    const colorDisabled = process.env.NO_COLOR !== undefined;
    if (colorDisabled) return false;

    const colorForced = process.env.FORCE_COLOR !== undefined && process.env.FORCE_COLOR !== '0';
    if (colorForced) return true;

    return process.stdout.isTTY === true;
  },

  writeOrPrint(output: string, exportPath: string | undefined, color = false): void {
    const outputWithContextSummary = appendOutputContextSummary(output, { color });
    const shouldPrint = exportPath === undefined;
    if (shouldPrint) {
      console.log(outputWithContextSummary);
      return;
    }

    const writeResult = trySafe(() => fs.writeFileSync(exportPath, outputWithContextSummary));
    if (Result.isErr(writeResult)) {
      cli.printCliError(writeResult.error);
      process.exit(1);
    }

    console.log('\n\nThe result has been saved into ' + exportPath);
  },
};

program
  .name('tree')
  .description('Powerful project structure visualizer: generates directory trees or file outlines.')
  .version(cli.readPackageVersion())
  .argument('[path]', 'Directory or File path to analyze')
  .option('-d, --directory <dir>', 'Specify a path (alternative to positional argument)')
  .option('-i, --ignore [ig]', 'Regex pattern to ignore (directories and related-file scans)')
  .option('-e, --export [epath]', 'Export result to a file')
  .option('-f, --only-folder', 'Output folders only (only for directories)')
  .option('-r, --related [mode]', 'Show related files for a file using imports. Modes: imports, importers, both.')
  .option('--root <dir>', 'Project root for --related scans. Defaults to the current directory.')
  .option('--depth <depth>', 'Max traversal depth for --related. Use "all" for the full graph.', 'all')
  .option('--summary', 'Use the layered related-file summary instead of the full nested tree.')
  .option('--tree', 'Use the full nested related-file tree. This is the default for --related.')
  .action((dirArg: unknown, rawOptions: unknown) => {
    const options = cli.parseCliOptions(rawOptions);
    const targetPath = cli.getTargetPath(dirArg, options);
    const statsResult = trySafe(() => fs.lstatSync(targetPath));
    const hasRelatedMode = cli.hasRelatedOption(options.related);
    const hasMissingRelatedTarget = Result.isErr(statsResult) && hasRelatedMode;

    if (hasMissingRelatedTarget) {
      cli.printCliError(statsResult.error);
      process.exit(1);
    }

    if (Result.isErr(statsResult)) {
      cli.absorbRecoverableBoundaryError(statsResult.error);
      cli.handleDirectoryTarget(targetPath, options);
      return;
    }

    const isFileTarget = statsResult.value.isFile();
    const isSymbolicLinkTarget = statsResult.value.isSymbolicLink();
    const shouldHandleAsRelatedTarget =
      hasRelatedMode && (isFileTarget || isSymbolicLinkTarget);
    if (shouldHandleAsRelatedTarget) {
      cli.handleFileTarget(targetPath, options);
      return;
    }

    if (isFileTarget) {
      cli.handleFileTarget(targetPath, options);
      return;
    }

    cli.handleDirectoryTarget(targetPath, options);
  });

program.parse(process.argv);
