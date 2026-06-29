import { readTextFile } from '@/related-files/shared/safety';
import { countTextLines } from './count-text-lines';

export function getFileLineCount(filePath: string): number | null {
  const content = readTextFile(filePath);
  return content === null ? null : countTextLines(content);
}
