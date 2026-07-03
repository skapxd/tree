import { isRecord } from './is-record';
import { type PackageJson } from './types';

export function isPackageJson(value: unknown): value is PackageJson {
  const isPackageObject = isRecord(value);
  if (!isPackageObject) return false;

  return typeof value.version === 'string';
}
