import {
  createTextStats,
  readTextContent,
  type TextStats,
} from '@/shared/text-stats';

export function getFileTextStats(filePath: string): TextStats | null {
  const content = readTextContent(filePath);
  return content === null ? null : createTextStats(content);
}
