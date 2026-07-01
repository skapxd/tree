import path from 'node:path';
import { NO_EXTENSION_LABEL } from './constants';

export function getExtension(filePath: string): string {
  const extension = path.extname(filePath);
  return extension === '' ? NO_EXTENSION_LABEL : extension;
}
