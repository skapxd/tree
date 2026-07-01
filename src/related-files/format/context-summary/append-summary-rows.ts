export function appendSummaryRows(lines: string[], rows: string[], hasLargestFiles: boolean): void {
  rows.forEach((row, index) => {
    const isLast = !hasLargestFiles && index === rows.length - 1;
    lines.push(`${isLast ? '└──' : '├──'} ${row}`);
  });
}
