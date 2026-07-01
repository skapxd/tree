export function appendFlatRows(lines: string[], rows: string[], hasSections: boolean): void {
  rows.forEach((row, index) => {
    const isLast = !hasSections && index === rows.length - 1;
    lines.push(`${isLast ? '└──' : '├──'} ${row}`);
  });
}
