import { createIgnoreState } from '@/fs-tree/gitignore';
import { walkSupportedFiles } from './walk-supported-files';
import { parseCustomIgnore } from './parse-custom-ignore';

export function findSupportedFiles(root: string, ignore?: string | RegExp): string[] {
  const customIgnore = parseCustomIgnore(ignore);
  const state = createIgnoreState(root, null);
  const files: string[] = [];
  walkSupportedFiles(root, root, state, customIgnore, files);
  return files.sort();
}
