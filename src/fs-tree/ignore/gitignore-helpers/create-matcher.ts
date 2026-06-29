import { Result, trySafe } from '@skapxd/result';
import ignore from 'ignore';
import { absorbRecoverableBoundaryError } from './absorb-recoverable-boundary-error';
import { type IgnoreMatcher } from './types';

export function createMatcher(content: string): IgnoreMatcher | null {
  const result = trySafe(() => ignore().add(content));
  if (Result.isErr(result)) {
    absorbRecoverableBoundaryError(result.error);
    return null;
  }

  return result.value;
}
