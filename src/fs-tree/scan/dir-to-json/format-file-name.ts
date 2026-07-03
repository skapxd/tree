import { formatTextStatsLabel, type TextStats } from '@/shared/text-stats';
import path from 'node:path';

export function formatFileName(filePath: string, stats: TextStats | null): string {
  const fileName = path.basename(filePath);
  if (stats === null) return fileName;

  return `${fileName} (${formatTextStatsLabel(stats)})`;
}
