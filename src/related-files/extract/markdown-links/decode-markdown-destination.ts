import { Result, trySafe } from '@skapxd/result';
import { absorbRecoverableBoundaryError } from '@/related-files/shared/safety';

export function decodeMarkdownDestination(destination: string): string {
  const result = trySafe(() => decodeURI(destination));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return destination;
  }

  return result.value;
}
