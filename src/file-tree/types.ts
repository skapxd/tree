export interface Section {
  level: number;
  title: string;
  kind?: string; // e.g., 'function', 'class', 'import', 'heading'
  fullHeading: string;
  startLine: number;
  endLine: number;
}

export interface OutlineResult {
  lines: string[];
  sections: Section[];
}

/**
 * Interface that every parser must implement.
 */
export interface Parser {
  parse(content: string): OutlineResult;
}
