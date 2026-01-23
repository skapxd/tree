/**
 * Sorts directory contents so that files come before folders.
 * Objects (directories) are put at the end.
 */
export function sortDir(arr: (string | object)[]): (string | object)[] {
  let i = arr.length - 1;
  while (i >= 0) {
    if (typeof arr[i] === 'object') {
      const obj = arr.splice(i, 1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      arr.push(obj[0]!);
    }
    i--;
  }
  return arr;
}

/**
 * Parses the ignore argument string into a RegExp object.
 * @param ignoreStr - The string passed via CLI (e.g. "node_modules|dist")
 */
export function parseIgnoreOption(ignoreStr?: string): RegExp | null {
  if (!ignoreStr) return null;

  let cleanStr = ignoreStr.replace(/^\s*|\s*$/g, '');

  // Check if it's already a regex format like /node_modules/
  if (/^\/.+\/$/.test(cleanStr)) {
    cleanStr = cleanStr.replace(/(^\/)|(\/$)/g, '');
    return new RegExp(cleanStr, '');
  } else {
    // Treat simple strings with pipes as regex OR, without escaping special chars excessively
    // to allow user provided regex-like strings (e.g. "node_modules|.git")
    return new RegExp(cleanStr, '');
  }
}
