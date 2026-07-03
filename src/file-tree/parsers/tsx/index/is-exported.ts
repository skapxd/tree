import ts from 'typescript';

export function isExported(node: ts.Node): boolean {
  const canHaveModifiers = ts.canHaveModifiers(node);
  if (!canHaveModifiers) return false;

  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
}
