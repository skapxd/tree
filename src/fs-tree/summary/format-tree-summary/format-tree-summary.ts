import { type TreeSummary } from '@/fs-tree/summary/types';
import { type SummaryStyleOptions } from '@/shared/summary-style';
import { appendFlatRows } from './append-flat-rows';
import { appendSections } from './append-sections';
import { createFlatRows } from './create-flat-rows';
import { createSections } from './create-sections';

export function formatTreeSummary(
  summary: TreeSummary,
  options: SummaryStyleOptions = {}
): string {
  const lines = ['summary'];
  const rows = createFlatRows(summary);
  const sections = createSections(summary);

  appendFlatRows(lines, rows, sections.length > 0, options);
  appendSections(lines, sections, options);

  return lines.join('\n');
}
