export function parseIgnoreOption(ignoreStr?: string): RegExp | null {
  const lacksIgnore = ignoreStr === undefined || ignoreStr.length === 0;
  if (lacksIgnore) return null;

  const cleanStr = ignoreStr.replace(/^\s*|\s*$/g, '');
  const isRegexLiteral = /^\/.+\/$/.test(cleanStr);
  const pattern = isRegexLiteral ? cleanStr.replace(/(^\/)|(\/$)/g, '') : cleanStr;

  return new RegExp(pattern, '');
}
