export function renderFileList(lines: string[], files: string[], prefix: string): void {
  const lacksFiles = files.length === 0;
  if (lacksFiles) {
    lines.push(`${prefix}└── (none)`);
    return;
  }

  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    lines.push(`${prefix}${isLast ? '└── ' : '├── '}${file}`);
  });
}
