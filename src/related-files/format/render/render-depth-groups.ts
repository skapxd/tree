import { type RelatedEntryGroup } from '@/related-files/types';
import { renderFileList } from './render-file-list';

export function renderDepthGroups(
  lines: string[],
  groups: RelatedEntryGroup[],
  prefix: string
): void {
  const lacksGroups = groups.length === 0;
  if (lacksGroups) {
    lines.push(`${prefix}└── (none)`);
    return;
  }

  groups.forEach((group, index) => {
    const isLastGroup = index === groups.length - 1;
    const groupPrefix = `${prefix}${isLastGroup ? '└── ' : '├── '}`;
    const childPrefix = `${prefix}${isLastGroup ? '    ' : '│   '}`;
    lines.push(`${groupPrefix}depth ${group.depth} (${group.files.length})`);
    renderFileList(lines, group.files, childPrefix);
  });
}
