import { Result, trySafe } from '@skapxd/result';
import fs from 'node:fs';
import { absorbRecoverableBoundaryError } from '@/shared/safety';

const TEXT_DETECTION_SAMPLE_SIZE = 8192;

export function readTextSample(filePath: string): Buffer | null {
  const openResult = trySafe(() => fs.openSync(filePath, 'r'));
  if (Result.isErr(openResult)) {
    absorbRecoverableBoundaryError(openResult.error);
    return null;
  }

  const fileDescriptor = openResult.value;
  const buffer = Buffer.alloc(TEXT_DETECTION_SAMPLE_SIZE);
  const readResult = trySafe(() => {
    return fs.readSync(fileDescriptor, buffer, 0, TEXT_DETECTION_SAMPLE_SIZE, 0);
  });
  const closeResult = trySafe(() => fs.closeSync(fileDescriptor));
  if (Result.isErr(closeResult)) {
    absorbRecoverableBoundaryError(closeResult.error);
  }

  if (Result.isErr(readResult)) {
    absorbRecoverableBoundaryError(readResult.error);
    return null;
  }

  return buffer.subarray(0, readResult.value);
}
