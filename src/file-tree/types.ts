export type Section = {
  level: number;
  title: string;
  kind?: string; // e.g., 'function', 'class', 'import', 'heading'
  fullHeading: string;
  startLine: number;
  endLine: number;
}

export type OutlineResult = {
  lines: string[];
  sections: Section[];
}

/**
 * Interface that every parser must implement.
 */
export type Parser = {
  parse(content: string): OutlineResult;
}
