export function getMedianLineCount(lineCounts: number[]): number {
  const lacksLineCounts = lineCounts.length === 0;
  if (lacksLineCounts) return 0;

  const sortedLineCounts = [...lineCounts].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedLineCounts.length / 2);
  const hasOddLength = sortedLineCounts.length % 2 === 1;
  if (hasOddLength) return sortedLineCounts[middleIndex] ?? 0;

  const leftValue = sortedLineCounts[middleIndex - 1] ?? 0;
  const rightValue = sortedLineCounts[middleIndex] ?? 0;
  return Math.round((leftValue + rightValue) / 2);
}
