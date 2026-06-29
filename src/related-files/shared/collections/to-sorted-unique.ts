export function toSortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}
