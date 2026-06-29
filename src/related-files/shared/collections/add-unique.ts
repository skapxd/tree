export function addUnique(values: string[], value: string): void {
  const alreadyIncludesValue = values.includes(value);
  if (alreadyIncludesValue) return;

  values.push(value);
}
