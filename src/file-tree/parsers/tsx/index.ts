import ts from 'typescript';
import { type Parser, type OutlineResult, type Section } from '../../types';

export const tsxParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];

    // Create AST from source
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      content,
      ts.ScriptTarget.Latest,
      true // setParentNodes
    );

    function visitNode(node: ts.Node, level: number) {
      let title = '';
      let kind = '';
      let shouldRecurse = true;
      let nextLevel = level;

      // --- Imports (Top-level only usually) ---
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
        title = moduleSpecifier;
        kind = 'import';
        shouldRecurse = false; // Don't look inside imports
      }
      
      // --- Functions (Declaration, Expression, Arrow) ---
      else if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
        if (ts.isFunctionDeclaration(node)) {
            title = node.name?.text || 'anonymous';
        } else {
             // Try to infer name from parent variable/property assignment if possible, 
             // but usually the parent handles the title. 
             // If we are here, it might be an anonymous function or we are visiting the function body.
             // Actually, for Arrow/Expression, often the parent (Variable/Property) creates the entry.
             // We just need to ensure we recurse into the BODY.
             
             // If this node is NOT a standalone statement (like FunctionDeclaration), 
             // we might skip creating a section for it if the parent already did.
             // But if it's an anonymous function passed as arg, maybe we want to show it?
             // For now, let's only title FunctionDeclarations, and rely on parent handling for Arrows assigned to vars.
        }
        
        if (title && title !== 'anonymous') {
            kind = 'func';
            if (isExported(node)) kind = 'func export';
        }
        
        nextLevel = level + 1;
      }
      
      // --- Classes ---
      else if (ts.isClassDeclaration(node)) {
        title = node.name?.text || 'anonymous';
        kind = 'class';
        if (isExported(node)) kind = 'class export';
        nextLevel = level + 1;
      }
      
      // --- Interfaces ---
      else if (ts.isInterfaceDeclaration(node)) {
        title = node.name.text;
        kind = 'intf';
        if (isExported(node)) kind = 'intf export';
        nextLevel = level + 1;
      }
      
      // --- Type Aliases ---
      else if (ts.isTypeAliasDeclaration(node)) {
        title = node.name.text;
        kind = 'type';
        if (isExported(node)) kind = 'type export';
        nextLevel = level + 1; // Types might have object literals inside?
      }
      
      // --- Variables (const/let/var) ---
      else if (ts.isVariableStatement(node)) {
        // VariableStatement contains VariableDeclarationList which contains VariableDeclaration(s)
        // We handle the Statement to capture the "Export" modifier easily
        const list = node.declarationList;
        for (const decl of list.declarations) {
            visitVariableDeclaration(decl, level, isExported(node));
        }
        return; // We handled children manually
      }

      // --- Methods / Properties in Classes/Interfaces/Literals ---
      else if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
        if (ts.isIdentifier(node.name)) {
            title = node.name.text;
            kind = 'meth';
            nextLevel = level + 1;
        }
      }
      else if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node)) {
         if (ts.isIdentifier(node.name)) {
            title = node.name.text;
            kind = 'prop';
            // Check if initializer is an arrow function or function expression to change kind?
            if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
                kind = 'meth';
            }
            nextLevel = level + 1;
         }
      }
      else if (ts.isPropertyAssignment(node)) {
          // Object literal property:  key: value
          if (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) {
              title = node.name.text;
              kind = 'prop';
              if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
                  kind = 'meth'; // It's a method-like property
              } else if (ts.isObjectLiteralExpression(node.initializer)) {
                  // It's a nested object, like 'parse' in the user example containing 'lines', 'sections'
                  // We treat it as a prop, but recursion will fill children
              }
              nextLevel = level + 1;
          }
      }

      // --- Call Expressions (e.g. program.action(() => ...), describe('...', () => ...)) ---
      else if (ts.isCallExpression(node)) {
          // Check if any argument is a function, indicating a callback block
          const hasCallback = node.arguments.some(arg => 
              ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)
          );

          if (hasCallback) {
              // Try to get the function name
              let name = '';
              if (ts.isIdentifier(node.expression)) {
                  name = node.expression.text;
              } else if (ts.isPropertyAccessExpression(node.expression)) {
                  name = node.expression.name.text;
              }

              if (name) {
                  title = `${name}() callback`;
                  kind = 'call';
                  nextLevel = level + 1;
              }
          }
      }

      // --- Add to sections if we found a meaningful entity ---
      if (title) {
        // Adjust level: The user wants nesting. 
        // Note: 'level' passed in is the indentation level.
        
        const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(node.getEnd());

        sections.push({
          level,
          title,
          kind,
          fullHeading: lines[startLine] || title,
          startLine: startLine + 1,
          endLine: endLine + 1,
        });
      }

      // --- Recursion Logic ---
      if (shouldRecurse) {
          ts.forEachChild(node, (child) => visitNode(child, nextLevel));
      }
    }

    function visitVariableDeclaration(node: ts.VariableDeclaration, level: number, exported: boolean) {
        let kind = 'var';
        if (exported) kind = 'var export';

        // Helper to push a section
        const addSection = (name: string, nodeToMap: ts.Node, forceKind?: string) => {
             const { line: startLine } = sourceFile.getLineAndCharacterOfPosition(nodeToMap.getStart());
             const { line: endLine } = sourceFile.getLineAndCharacterOfPosition(nodeToMap.getEnd());

             sections.push({
                level,
                title: name,
                kind: forceKind || kind,
                fullHeading: lines[startLine] || name,
                startLine: startLine + 1,
                endLine: endLine + 1,
             });
        };

        if (ts.isIdentifier(node.name)) {
            const title = node.name.text;
            
            // Check if it's a function assignment (const foo = () => {})
            let finalKind = kind;
            if (node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
                 finalKind = 'func';
                 if (exported) finalKind = 'func export';
            }
            
            addSection(title, node, finalKind);

             // Recurse into initializer
             if (node.initializer) {
                 visitNode(node.initializer, level + 1);
             }
        } 
        else if (ts.isObjectBindingPattern(node.name) || ts.isArrayBindingPattern(node.name)) {
            // Handle destructuring: const { a, b } = obj; or const [x, y] = arr;
            // We just list the bound names. We generally don't recurse into initializers for individual bindings easily 
            // unless we want to associate the whole initializer with each? 
            // Usually destructuring doesn't define "methods" via initializer in the same way.
            
            for (const element of node.name.elements) {
                if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
                    addSection(element.name.text, element);
                }
            }
            
            // Still recurse into the initializer of the whole statement to find things inside? 
            // e.g. const { a } = someFunction(() => { ... })
            if (node.initializer) {
                 visitNode(node.initializer, level + 1);
            }
        }
    }

    // Start traversal at level 1
    // We iterate specific top-level statements to avoid wrapping everything in a "SourceFile" node
    ts.forEachChild(sourceFile, (node) => visitNode(node, 1));

    return { lines, sections };
  },
};

function isExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
  );
}