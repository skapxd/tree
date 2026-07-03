import ts from 'typescript';

export function getExpressionName(expression: ts.Expression): string | null {
  const isIdentifierExpression = ts.isIdentifier(expression);
  if (isIdentifierExpression) return expression.text;

  const isPropertyAccessExpression = ts.isPropertyAccessExpression(expression);
  if (isPropertyAccessExpression) return expression.name.text;

  return null;
}
