import { type SummaryStyleOptions } from '@/shared/summary-style';
import { formatSummaryFile } from './format-summary-file';
import { type RelatedSummaryFile } from './types';

export function appendLargestFiles(
  lines: string[],
  root: string,
  largestFiles: RelatedSummaryFile[],
  options: SummaryStyleOptions = {}
): void {
  const lacksLargestFiles = largestFiles.length === 0;
  if (lacksLargestFiles) return;

  lines.push('└── largest files by chars');
  largestFiles.forEach((file, index) => {
    const isLast = index === largestFiles.length - 1;
    lines.push(`    ${isLast ? '└──' : '├──'} ${formatSummaryFile(root, file, options)}`);
  });
}
