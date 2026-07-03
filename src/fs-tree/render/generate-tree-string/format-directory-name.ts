export function formatDirectoryName(name: string): string {
  return name.endsWith('/') ? name : `${name}/`;
}
