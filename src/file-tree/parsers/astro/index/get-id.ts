export function getId(attrs: string): string | null {
  const idMatch = attrs.match(/id=["']([^"']+)["']/);
  return idMatch?.[1] ?? null;
}
