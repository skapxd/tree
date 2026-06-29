import {
  type RelatedFileEntry,
  type RelatedFormatOptions,
} from '@/related-files/types';
import { countTransitive } from './count-transitive';
import { groupEntriesByDepth } from './group-entries-by-depth';
import { renderDepthGroups } from './render-depth-groups';
import { renderFileList } from './render-file-list';
import { toProjectPathList } from './to-project-path-list';

export function renderLayeredSection(
  lines: string[],
  label: string,
  directLabel: string,
  transitiveLabel: string,
  root: string,
  entries: RelatedFileEntry[],
  options: RelatedFormatOptions = {}
): void {
  const directFiles = toProjectPathList(
    root,
    entries.filter(entry => entry.depth === 1),
    options
  ).sort();
  const transitiveGroups = groupEntriesByDepth(
    root,
    entries.filter(entry => entry.depth > 1),
    options
  );
  const directCount = directFiles.length;
  const transitiveCount = countTransitive(entries);

  lines.push(label);
  lines.push(`├── ${directLabel} (${directCount})`);
  renderFileList(lines, directFiles, '│   ');
  lines.push(`└── ${transitiveLabel} (${transitiveCount})`);
  renderDepthGroups(lines, transitiveGroups, '    ');
}
