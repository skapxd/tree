import { readTextContent } from '@/shared/text-stats';

export function readTextFile(filePath: string): string | null {
  return readTextContent(filePath);
}
