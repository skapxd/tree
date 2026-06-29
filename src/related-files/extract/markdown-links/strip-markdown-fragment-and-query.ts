export function stripMarkdownFragmentAndQuery(destination: string): string {
  const hashIndex = destination.indexOf('#');
  const queryIndex = destination.indexOf('?');
  const indexes = [hashIndex, queryIndex].filter(index => index >= 0);
  const cutoff = indexes.length === 0 ? -1 : Math.min(...indexes);
  return cutoff >= 0 ? destination.slice(0, cutoff) : destination;
}
