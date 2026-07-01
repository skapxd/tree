import { type Expression } from 'typescript';

export type StaticStringScope = Map<string, string[] | null>;

export type StaticStringEvaluator = (
  expression: Expression,
  scopes: StaticStringScope[]
) => string[] | null;
