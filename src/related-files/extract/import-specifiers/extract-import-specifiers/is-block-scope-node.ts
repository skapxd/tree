import ts, { type Node } from 'typescript';

export function isBlockScopeNode(node: Node): boolean {
  return ts.isBlock(node)
    || ts.isCaseBlock(node)
    || ts.isModuleBlock(node);
}
