import { buildTreeFromSections } from '@/file-tree/sections/build-tree-from-sections';
import { type Section } from '@/file-tree/types';
import { drawLegacyTree } from './format-single-file-outline/draw-legacy-tree';
import { formatHeader } from './format-single-file-outline/format-header';

export function formatSingleFileOutline(
  filePath: string,
  lines: string[],
  sections: Section[]
): string {
  void filePath;
  void lines;

  const lacksSections = sections.length === 0;
  if (lacksSections) {
    return '  (No structural elements found)';
  }

  const tree = buildTreeFromSections(sections);
  const outputLines = formatHeader();
  drawLegacyTree(outputLines, tree);

  return outputLines.join('\n');
}
