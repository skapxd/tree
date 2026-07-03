import {
  formatRelatedFilesSummary,
  formatRelatedFilesTree,
  getRelatedFiles,
} from '@/related-files';
import { canColorOutput } from './can-color-output';
import { parseRelatedDepth } from './parse-related-depth';
import { parseRelatedDirection } from './parse-related-direction';
import { type CliOptions } from './types';

export function createRelatedOutput(targetPath: string, options: CliOptions): string {
  const maxDepth = parseRelatedDepth(options.depth);
  const relatedOptions = {
    file: targetPath,
    root: options.root ?? process.cwd(),
    direction: parseRelatedDirection(options.related),
    ...(maxDepth === undefined ? {} : { maxDepth }),
    ...(options.ignore === undefined ? {} : { ignore: options.ignore }),
  };
  const relatedFiles = getRelatedFiles(relatedOptions);
  const formatOptions = {
    color: canColorOutput(options.outputPath),
  };
  const shouldRenderSummary = options.summary && !options.tree;

  return shouldRenderSummary
    ? formatRelatedFilesSummary(relatedFiles, formatOptions)
    : formatRelatedFilesTree(relatedFiles, formatOptions);
}
