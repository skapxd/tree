import { MAX_STATIC_VALUES } from './constants';
import { toLimitedUniqueValues } from './to-limited-unique-values';

export function joinStaticValues(leftValues: string[], rightValues: string[]): string[] | null {
  const values: string[] = [];

  for (const leftValue of leftValues) {
    for (const rightValue of rightValues) {
      values.push(`${leftValue}${rightValue}`);
      const exceedsStaticValueLimit = values.length > MAX_STATIC_VALUES;
      if (exceedsStaticValueLimit) return null;
    }
  }

  return toLimitedUniqueValues(values);
}
