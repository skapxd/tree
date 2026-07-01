import { MAX_STATIC_VALUES } from './constants';

export function toLimitedUniqueValues(values: string[]): string[] | null {
  const uniqueValues = Array.from(new Set(values));
  const exceedsStaticValueLimit = uniqueValues.length > MAX_STATIC_VALUES;
  if (exceedsStaticValueLimit) return null;

  return uniqueValues;
}
