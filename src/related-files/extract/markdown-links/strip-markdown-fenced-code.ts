import { getMarkdownFenceMarker } from './get-markdown-fence-marker';

export function stripMarkdownFencedCode(content: string): string {
  const lines = content.split('\n');
  let inFence = false;
  let fenceMarker = '';

  return lines
    .map(line => {
      const marker = getMarkdownFenceMarker(line);
      const isRegularLine = marker === null;

      if (isRegularLine) {
        return inFence ? '' : line;
      }

      const isOpeningFence = !inFence;
      if (isOpeningFence) {
        inFence = true;
        fenceMarker = marker.charAt(0);
        return '';
      }

      const closesActiveFence = marker.startsWith(fenceMarker);
      if (closesActiveFence) {
        inFence = false;
        fenceMarker = '';
      }

      return '';
    })
    .join('\n');
}
