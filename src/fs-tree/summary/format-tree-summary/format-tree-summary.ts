import { type TreeSummary } from '@/fs-tree/summary/types';
import { appendFlatRows } from './append-flat-rows';
import { appendSections } from './append-sections';
import { createFlatRows } from './create-flat-rows';
import { createSections } from './create-sections';

export function formatTreeSummary(summary: TreeSummary): string {
  const lines = ['summary'];
  const rows = createFlatRows(summary);
  const sections = createSections(summary);

  appendFlatRows(lines, rows, sections.length > 0);
  appendSections(lines, sections);

  return lines.join('\n');
}
