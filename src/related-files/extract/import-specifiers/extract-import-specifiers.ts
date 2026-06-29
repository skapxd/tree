import path from 'node:path';
import ts from 'typescript';
import { addUnique } from '@/related-files/shared/collections';
import { isMarkdownFile } from '@/related-files/shared/path';
import { type ExtractedSpecifier } from '@/related-files/types';
import { extractMarkdownLinkSpecifiers } from '@/related-files/extract/markdown-links';
import { getScriptKind } from './get-script-kind';
import { getSourceTextForImportParsing } from './get-source-text-for-import-parsing';
import { toExtractedSpecifiers } from './to-extracted-specifiers';

export function extractImportSpecifiers(
  filePath: string,
  content: string
): ExtractedSpecifier[] {
  const isMarkdownImportFile = isMarkdownFile(filePath);
  if (isMarkdownImportFile) {
    return extractMarkdownLinkSpecifiers(content);
  }

  const sourceText = getSourceTextForImportParsing(filePath, content);
  const specifiers: string[] = [];
  const sourceFile = ts.createSourceFile(
    path.basename(filePath),
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );

  function visit(node: ts.Node): void {
    const isStaticImport =
      ts.isImportDeclaration(node) &&
      ts.isStringLiteralLike(node.moduleSpecifier);
    if (isStaticImport) {
      addUnique(specifiers, node.moduleSpecifier.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isReExport =
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(node.moduleSpecifier);
    if (isReExport) {
      addUnique(specifiers, node.moduleSpecifier.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isExternalImportEquals =
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteralLike(node.moduleReference.expression);
    if (isExternalImportEquals) {
      addUnique(specifiers, node.moduleReference.expression.text);
      ts.forEachChild(node, visit);
      return;
    }

    const isCallImport = ts.isCallExpression(node);
    if (!isCallImport) {
      ts.forEachChild(node, visit);
      return;
    }

    const firstArg = node.arguments[0];
    if (firstArg === undefined) {
      ts.forEachChild(node, visit);
      return;
    }

    const hasStringSpecifierArgument = ts.isStringLiteralLike(firstArg);
    if (!hasStringSpecifierArgument) {
      ts.forEachChild(node, visit);
      return;
    }

    const isDynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
    const isCommonJsRequire =
      ts.isIdentifier(node.expression) && node.expression.text === 'require';
    const isImportCall = isDynamicImport || isCommonJsRequire;

    if (isImportCall) {
      addUnique(specifiers, firstArg.text);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return toExtractedSpecifiers(specifiers);
}
