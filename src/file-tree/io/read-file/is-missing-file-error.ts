import { isNodeError } from './is-node-error';

export function isMissingFileError(error: unknown): boolean {
  return isNodeError(error) && error.code === 'ENOENT';
}
