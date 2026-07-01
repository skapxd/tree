export function getMedianCount(values: number[]): number {
  const lacksValues = values.length === 0;
  if (lacksValues) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);
  const hasOddLength = sortedValues.length % 2 === 1;
  if (hasOddLength) return sortedValues[middleIndex] ?? 0;

  const leftValue = sortedValues[middleIndex - 1] ?? 0;
  const rightValue = sortedValues[middleIndex] ?? 0;
  return Math.round((leftValue + rightValue) / 2);
}
