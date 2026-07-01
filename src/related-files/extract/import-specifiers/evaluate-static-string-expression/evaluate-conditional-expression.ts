import { type ConditionalExpression } from 'typescript';
import { toLimitedUniqueValues } from './to-limited-unique-values';
import {
  type StaticStringEvaluator,
  type StaticStringScope,
} from './types';

export function evaluateConditionalExpression(
  expression: ConditionalExpression,
  scopes: StaticStringScope[],
  evaluateExpression: StaticStringEvaluator
): string[] | null {
  const whenTrueValues = evaluateExpression(expression.whenTrue, scopes);
  const whenFalseValues = evaluateExpression(expression.whenFalse, scopes);
  const lacksStaticBranch = whenTrueValues === null || whenFalseValues === null;
  if (lacksStaticBranch) return null;

  return toLimitedUniqueValues([...whenTrueValues, ...whenFalseValues]);
}
