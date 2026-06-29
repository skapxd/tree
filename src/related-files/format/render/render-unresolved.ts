import {
  type RelatedFormatOptions,
  type UnresolvedImportEntry,
} from '@/related-files/types';
import {
  formatFileNodeLabel,
  getFileMetadataLines,
  getRelationshipMetadataLines,
} from '@/related-files/format/file-label';

export function renderUnresolved(
  lines: string[],
  root: string,
  unresolved: UnresolvedImportEntry[],
  prefix: string,
  options: RelatedFormatOptions = {}
): void {
  const lacksUnresolved = unresolved.length === 0;
  if (lacksUnresolved) {
    lines.push(`${prefix}└── (none)`);
    return;
  }

  unresolved.forEach((entry, index) => {
    const isLast = index === unresolved.length - 1;
    lines.push(
      `${prefix}${isLast ? '└── ' : '├── '}${formatFileNodeLabel(
        root,
        entry.file,
        options
      )} -> ${entry.specifier}`
    );

    const metadataLines = [
      ...getFileMetadataLines(entry.file),
      ...getRelationshipMetadataLines(root, entry.file, entry.metadata),
    ];
    const childPrefix = `${prefix}${isLast ? '    ' : '│   '}`;

    metadataLines.forEach((metadataLine, metadataIndex) => {
      const metadataIsLast = metadataIndex === metadataLines.length - 1;
      lines.push(`${childPrefix}${metadataIsLast ? '└── ' : '├── '}${metadataLine}`);
    });
  });
}
