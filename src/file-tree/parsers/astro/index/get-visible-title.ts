export function getVisibleTitle(name: string, id: string | null): string {
  return id === null ? name : `${name}#${id}`;
}
