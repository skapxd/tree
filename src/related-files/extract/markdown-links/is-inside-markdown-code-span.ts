export function isInsideMarkdownCodeSpan(line: string, index: number): boolean {
  let inCodeSpan = false;

  for (let position = 0; position < index; position += 1) {
    const isBacktick = line[position] === '`';
    if (!isBacktick) continue;

    while (line[position + 1] === '`') {
      position += 1;
    }

    inCodeSpan = !inCodeSpan;
  }

  return inCodeSpan;
}
