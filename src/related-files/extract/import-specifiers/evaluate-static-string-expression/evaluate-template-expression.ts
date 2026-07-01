import { type TemplateExpression } from 'typescript';
import { joinStaticValues } from './join-static-values';
import {
  type StaticStringEvaluator,
  type StaticStringScope,
} from './types';

export function evaluateTemplateExpression(
  expression: TemplateExpression,
  scopes: StaticStringScope[],
  evaluateExpression: StaticStringEvaluator
): string[] | null {
  let values = [expression.head.text];

  for (const span of expression.templateSpans) {
    const expressionValues = evaluateExpression(span.expression, scopes);
    if (expressionValues === null) return null;
    const valuesWithExpression = joinStaticValues(values, expressionValues);
    if (valuesWithExpression === null) return null;

    const valuesWithLiteral = joinStaticValues(valuesWithExpression, [span.literal.text]);
    if (valuesWithLiteral === null) return null;

    values = valuesWithLiteral;
  }

  return values;
}
