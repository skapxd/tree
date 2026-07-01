import ts, { type BinaryExpression } from 'typescript';
import { joinStaticValues } from './join-static-values';
import {
  type StaticStringEvaluator,
  type StaticStringScope,
} from './types';

export function evaluateBinaryExpression(
  expression: BinaryExpression,
  scopes: StaticStringScope[],
  evaluateExpression: StaticStringEvaluator
): string[] | null {
  const isStringConcat = expression.operatorToken.kind === ts.SyntaxKind.PlusToken;
  if (!isStringConcat) return null;

  const leftValues = evaluateExpression(expression.left, scopes);
  const rightValues = evaluateExpression(expression.right, scopes);
  const lacksStaticSide = leftValues === null || rightValues === null;
  if (lacksStaticSide) return null;

  return joinStaticValues(leftValues, rightValues);
}
