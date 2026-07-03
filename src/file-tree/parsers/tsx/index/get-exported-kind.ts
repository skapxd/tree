import ts from 'typescript';
import { isExported } from './is-exported';

export function getExportedKind(baseKind: string, node: ts.Node): string {
  const isExportedNode = isExported(node);
  return isExportedNode ? `${baseKind} export` : baseKind;
}
