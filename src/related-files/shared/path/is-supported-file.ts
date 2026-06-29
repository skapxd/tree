import path from 'node:path';
import { SUPPORTED_EXTENSION_SET } from '@/related-files/constants';

export function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_EXTENSION_SET.has(path.extname(filePath).toLowerCase());
}
