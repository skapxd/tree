import { findTagEnd } from './find-tag-end';
import { isScriptTagBoundary } from './is-script-tag-boundary';
import { type ScriptCloseTag } from './types';

const SCRIPT_CLOSE_TAG = '</script';

export function findScriptCloseTag(
  content: string,
  lowerContent: string,
  startIndex: number
): ScriptCloseTag | null {
  let searchIndex = startIndex;

  while (searchIndex < content.length) {
    const closeStart = lowerContent.indexOf(SCRIPT_CLOSE_TAG, searchIndex);
    const lacksCloseStart = closeStart < 0;
    if (lacksCloseStart) return null;

    const boundaryIndex = closeStart + SCRIPT_CLOSE_TAG.length;
    const hasScriptBoundary = isScriptTagBoundary(lowerContent[boundaryIndex]);
    if (!hasScriptBoundary) {
      searchIndex = boundaryIndex;
      continue;
    }

    const closeEnd = findTagEnd(content, boundaryIndex);
    const lacksCloseEnd = closeEnd < 0;
    if (lacksCloseEnd) return null;

    return { start: closeStart, end: closeEnd + 1 };
  }

  return null;
}
