import {
  type RelatedFormatOptions,
  type UnresolvedImportEntry,
} from '@/related-files/types';
import { renderUnresolved } from './render-unresolved';

export function renderSummaryUnresolved(
  lines: string[],
  root: string,
  unresolved: UnresolvedImportEntry[],
  label: string,
  options: RelatedFormatOptions = {}
): void {
  const lacksUnresolved = unresolved.length === 0;
  if (lacksUnresolved) return;

  const heading = label.charAt(0).toUpperCase() + label.slice(1);

  lines.push('');
  lines.push(`${heading} (${unresolved.length})`);
  renderUnresolved(lines, root, unresolved, '', options);
}
