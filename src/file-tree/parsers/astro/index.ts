import { type Parser, type OutlineResult, type Section } from '../../types';
import { tsxParser } from '../tsx';

export const astroParser: Parser = {
  parse(content: string): OutlineResult {
    const lines = content.split('\n');
    const sections: Section[] = [];

    const frontmatterRegex = /^---\r?\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);
    
    let templateStartIndex = 0;

    // 1. Script (Frontmatter)
    if (match) {
      const frontmatterContent = match[1] || '';
      const offset = 1;
      const result = tsxParser.parse(frontmatterContent);
      const shiftedSections = result.sections.map(section => ({
        ...section,
        startLine: section.startLine + offset,
        endLine: section.endLine + offset
      }));
      sections.push(...shiftedSections);
      templateStartIndex = match[0].length;
    }

    // 2. Template (Componentes + Custom Elements)
    const templateContent = content.slice(templateStartIndex);
    
    // Regex para capturar etiquetas: <tag, </tag, o <tag />
    const tagRegex = /<(\/?[a-zA-Z0-9\.-]+)([^>]*?)(\/?)>/g;
    
    const stack: string[] = [];
    // Elementos que no requieren cierre y no afectan la pila si no se cierran
    const voidElements = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

    let tagMatch;
    while ((tagMatch = tagRegex.exec(templateContent)) !== null) {
        const fullTag = tagMatch[0];
        const rawName = tagMatch[1] || '';
        const attrs = tagMatch[2] || '';
        // Detectar self-closing explícito (/) o implícito (void elements)
        const isSelfClosing = tagMatch[3] === '/' || voidElements.has(rawName.toLowerCase().replace('/', ''));

        if (rawName.startsWith('/')) {
            // Cierre: </tag>
            const name = rawName.slice(1);
            // Sacamos de la pila hasta encontrar el tag correspondiente (manejo básico de html mal formado)
            if (stack.length > 0) {
                const last = stack[stack.length - 1];
                if (last === name) {
                    stack.pop();
                }
            }
        } else {
            // Apertura: <tag>
            const name = rawName;
            
            // Criterios de inclusión:
            // 1. Empieza por Mayúscula (Componentes Astro/React/etc)
            const isComponent = /^[A-Z]/.test(name);
            // 2. Contiene un guión (Custom Elements)
            const isCustomElement = name.includes('-');
            // 3. Tiene un ID
            const idMatch = attrs.match(/id=["']([^"']+)["']/);
            const hasId = !!idMatch;

            const shouldShow = isComponent || isCustomElement || hasId;

            if (shouldShow) {
                let title = name;
                if (idMatch) {
                    title += `#${idMatch[1]}`;
                }

                const totalIndex = templateStartIndex + tagMatch.index;
                const textUpToMatch = content.slice(0, totalIndex);
                const startLine = textUpToMatch.split(/\r\n|\r|\n/).length;

                sections.push({
                    level: 1 + stack.length,
                    title,
                    kind: isComponent ? 'comp' : 'elem', // 'elem' para custom elements o html con id
                    fullHeading: lines[startLine - 1]?.trim() || title,
                    startLine,
                    endLine: startLine
                });
            }

            // Si no es self-closing, lo añadimos a la pila SIEMPRE, 
            // para mantener la profundidad correcta de sus hijos, sean o no mostrados.
            if (!isSelfClosing) {
                stack.push(name);
            }
        }
    }

    return { lines, sections };
  },
};