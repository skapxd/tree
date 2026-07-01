import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';
import { isKnownNonTextFile } from './is-known-non-text-file';
import { isLikelyTextBuffer } from './is-likely-text-buffer';
import { readTextSample } from './read-text-sample';

export function readTextContent(filePath: string): string | null {
  const isKnownNonText = isKnownNonTextFile(filePath);
  if (isKnownNonText) return null;

  const sample = readTextSample(filePath);
  if (sample === null) return null;

  const hasTextContent = isLikelyTextBuffer(sample);
  if (!hasTextContent) return null;

  const result = trySafe(() => fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n'));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
