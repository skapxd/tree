import { type RelatedFilesResult } from '@/related-files/types';
import { renderFileList } from './render-file-list';

export function renderSummaryNotes(lines: string[], result: RelatedFilesResult): void {
  const notes: string[] = [];
  const includesImporterRisk = result.direction === 'both' || result.direction === 'importers';
  const lacksLocalImporters = result.importers.length === 0;
  const shouldRenderEntrypointNote = includesImporterRisk && lacksLocalImporters;

  if (shouldRenderEntrypointNote) {
    notes.push('no local importers found; this file behaves like an entrypoint or unreferenced module');
  }

  const isDirectDepthScan = result.maxDepth === 1;
  if (isDirectDepthScan) {
    notes.push('depth is limited to direct relationships');
  }

  const lacksNotes = notes.length === 0;
  if (lacksNotes) return;

  lines.push('');
  lines.push('Notes');
  renderFileList(lines, notes, '');
}
