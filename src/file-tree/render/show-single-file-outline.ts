import { type Section } from '@/file-tree/types';
import { formatSingleFileOutline } from './format-single-file-outline';

export function showSingleFileOutline(
  filePath: string,
  lines: string[],
  sections: Section[]
): void {
  console.log(formatSingleFileOutline(filePath, lines, sections));
}
