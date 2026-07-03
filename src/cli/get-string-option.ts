export function getStringOption(value: unknown): string | undefined {
  const isStringOption = typeof value === 'string';
  return isStringOption ? value : undefined;
}
