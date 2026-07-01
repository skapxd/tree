import { readTextFile } from '@/related-files/shared/safety';
import { createTextStats, type TextStats } from '@/shared/text-stats';

export function getFileTextStats(filePath: string): TextStats | null {
  const content = readTextFile(filePath);
  return content === null ? null : createTextStats(content);
}
