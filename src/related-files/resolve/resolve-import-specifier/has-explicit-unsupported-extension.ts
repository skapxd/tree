import path from 'node:path';
import { KNOWN_UNSUPPORTED_IMPORT_EXTENSION_SET } from '@/related-files/constants';

export function hasExplicitUnsupportedExtension(specifier: string): boolean {
  const extension = path.extname(specifier).toLowerCase();
  const lacksExtension = extension.length === 0;
  if (lacksExtension) return false;

  return KNOWN_UNSUPPORTED_IMPORT_EXTENSION_SET.has(extension);
}
