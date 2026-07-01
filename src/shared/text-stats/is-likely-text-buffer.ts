import { Result, trySafe } from '@skapxd/result';
import { TextDecoder } from 'node:util';
import { absorbRecoverableBoundaryError } from '@/shared/safety';
import {
  MAX_CONTROL_BYTE_RATIO,
  NULL_BYTE,
} from './text-control-byte-constants';
import { isTextControlByte } from './is-text-control-byte';

export function isLikelyTextBuffer(buffer: Buffer): boolean {
  const isEmptyFile = buffer.length === 0;
  if (isEmptyFile) return true;

  const hasNullByte = buffer.includes(NULL_BYTE);
  if (hasNullByte) return false;

  const decodeResult = trySafe(() => {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    decoder.decode(buffer, { stream: true });
  });
  if (Result.isErr(decodeResult)) {
    absorbRecoverableBoundaryError(decodeResult.error);
    return false;
  }

  const controlByteCount = [...buffer].filter(isTextControlByte).length;
  return controlByteCount / buffer.length <= MAX_CONTROL_BYTE_RATIO;
}
