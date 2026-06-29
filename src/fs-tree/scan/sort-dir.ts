/**
 * Sorts directory contents so that files come before folders.
 * Objects (directories) are put at the end.
 */
export function sortDir<T extends string | object>(arr: T[]): T[] {
  let index = arr.length - 1;

  while (index >= 0) {
    const entry = arr[index];
    const isDirectoryEntry = typeof entry === 'object';

    if (isDirectoryEntry) {
      arr.splice(index, 1);
      arr.push(entry);
    }

    index -= 1;
  }

  return arr;
}
