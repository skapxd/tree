import {
  isRecord,
  isString,
} from '@/related-files/shared/safety';
import { type RawCompilerOptions } from '@/related-files/types';

export function getRawCompilerOptions(config: unknown): RawCompilerOptions | null {
  if (!isRecord(config)) return null;

  const compilerOptions = config.compilerOptions;
  if (!isRecord(compilerOptions)) {
    return { baseUrl: null, paths: null };
  }

  return {
    baseUrl: isString(compilerOptions.baseUrl)
      ? compilerOptions.baseUrl
      : null,
    paths: isRecord(compilerOptions.paths) ? compilerOptions.paths : null,
  };
}
