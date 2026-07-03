import { type Section } from '@/file-tree/types';
import { COL_LINES_WIDTH, COL_TYPE_WIDTH } from './constants';

export function formatCols(section: Section): string {
  const range = `${section.startLine}-${section.endLine}`.padStart(COL_LINES_WIDTH);
  const rawLabel = section.kind ?? 'item';
  const [firstLabel] = rawLabel.split(' ');
  const label = firstLabel ?? 'item';
  const exceedsTypeWidth = label.length > COL_TYPE_WIDTH - 2;
  const visibleLabel = exceedsTypeWidth
    ? label.substring(0, COL_TYPE_WIDTH - 2)
    : label;
  const kindCol = visibleLabel.padEnd(COL_TYPE_WIDTH);

  return `${range} │ ${kindCol} │`;
}
