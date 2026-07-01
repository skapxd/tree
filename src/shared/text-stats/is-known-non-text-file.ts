import path from 'node:path';
import { NON_TEXT_EXTENSIONS } from './non-text-extensions';

export function isKnownNonTextFile(filePath: string): boolean {
  return NON_TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}
