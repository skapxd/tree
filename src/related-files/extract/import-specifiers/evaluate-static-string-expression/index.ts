import ts, { type Expression } from 'typescript';
import { evaluateBinaryExpression } from './evaluate-binary-expression';
import { evaluateConditionalExpression } from './evaluate-conditional-expression';
import { evaluateTemplateExpression } from './evaluate-template-expression';
import { getStaticStringBinding } from './get-static-string-binding';
import { type StaticStringScope } from './types';

export { type StaticStringScope } from './types';

export function evaluateStaticStringExpression(
  expression: Expression,
  scopes: StaticStringScope[]
): string[] | null {
  if (ts.isStringLiteralLike(expression)) return [expression.text];
  if (ts.isNumericLiteral(expression)) return [expression.text];

  const isBooleanLiteral = expression.kind === ts.SyntaxKind.TrueKeyword
    || expression.kind === ts.SyntaxKind.FalseKeyword;
  if (isBooleanLiteral) return [expression.kind === ts.SyntaxKind.TrueKeyword ? 'true' : 'false'];

  if (ts.isIdentifier(expression)) {
    return getStaticStringBinding(expression.text, scopes);
  }

  if (ts.isTemplateExpression(expression)) {
    return evaluateTemplateExpression(expression, scopes, evaluateStaticStringExpression);
  }

  if (ts.isBinaryExpression(expression)) {
    return evaluateBinaryExpression(expression, scopes, evaluateStaticStringExpression);
  }

  if (ts.isParenthesizedExpression(expression)) {
    return evaluateStaticStringExpression(expression.expression, scopes);
  }

  const isTransparentTypeWrapper = ts.isAsExpression(expression)
    || ts.isSatisfiesExpression(expression);
  if (isTransparentTypeWrapper) {
    return evaluateStaticStringExpression(expression.expression, scopes);
  }

  if (ts.isNonNullExpression(expression)) {
    return evaluateStaticStringExpression(expression.expression, scopes);
  }

  if (ts.isConditionalExpression(expression)) {
    return evaluateConditionalExpression(expression, scopes, evaluateStaticStringExpression);
  }

  return null;
}
