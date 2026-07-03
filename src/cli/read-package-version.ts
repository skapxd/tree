import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';
import { isPackageJson } from './is-package-json';

const DEFAULT_VERSION = '0.0.0';

export function readPackageVersion(packageJsonPath: string): string {
  const readResult = trySafe(() => fs.readFileSync(packageJsonPath, 'utf-8'));
  if (Result.isErr(readResult)) {
    absorbRecoverableBoundaryError(readResult.error);
    return DEFAULT_VERSION;
  }

  const parseResult = trySafe((): unknown => JSON.parse(readResult.value));
  if (Result.isErr(parseResult)) {
    absorbRecoverableBoundaryError(parseResult.error);
    return DEFAULT_VERSION;
  }

  const packageJson = parseResult.value;
  const hasPackageVersion = isPackageJson(packageJson);
  return hasPackageVersion ? packageJson.version : DEFAULT_VERSION;
}
