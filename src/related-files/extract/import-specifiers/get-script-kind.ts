import path from 'node:path';
import ts from 'typescript';

export function getScriptKind(filePath: string): ts.ScriptKind {
  const extension = path.extname(filePath).toLowerCase();
  const isJavaScriptFile = extension === '.js' || extension === '.mjs' || extension === '.cjs';
  if (isJavaScriptFile) return ts.ScriptKind.JS;

  const isJsxFile = extension === '.jsx';
  if (isJsxFile) return ts.ScriptKind.JSX;

  const isTypeScriptFile = extension === '.ts';
  if (isTypeScriptFile) return ts.ScriptKind.TS;

  return ts.ScriptKind.TSX;
}
