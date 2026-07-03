import { ANSI_DIM, ANSI_RESET } from '@/shared/summary-style/constants';
import { FILE_METADATA_SUFFIX_REGEX } from './constants';

export function formatFileName(name: string, color = false): string {
  const match = name.match(FILE_METADATA_SUFFIX_REGEX);
  if (match === null) return name;

  const fileName = match[1];
  const metadata = match[2];
  const lacksMetadataMatch = fileName === undefined || metadata === undefined;
  if (lacksMetadataMatch) return name;

  const metadataSuffix = `(${metadata})`;
  return `${fileName} ${color ? `${ANSI_DIM}${metadataSuffix}${ANSI_RESET}` : metadataSuffix}`;
}
