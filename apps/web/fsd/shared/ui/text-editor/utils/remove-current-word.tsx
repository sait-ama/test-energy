import { $createTextNode, $getSelection, $isRangeSelection, $isTextNode } from 'lexical';

export const removeCurrentWord = () => {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  if (!selection.isCollapsed()) return;

  const anchor = selection.anchor;
  const node = anchor.getNode();

  if (!$isTextNode(node)) return;

  const text = node.getTextContent();
  const offset = anchor.offset;

  const before = text.slice(0, offset);
  const after = text.slice(offset);

  const wordStartMatch = before.match(/(?:\s|^)(\S+)$/);
  const wordEndMatch = after.match(/^(\S+)(?:\s|$)/);

  const wordStartOffset = wordStartMatch?.[1] ? offset - wordStartMatch[1].length : offset;
  const wordEndOffset = wordEndMatch?.[1] ? offset + wordEndMatch[1].length : offset;

  const newText = text.slice(0, wordStartOffset) + text.slice(wordEndOffset);
  const newTextNode = $createTextNode(newText);

  node.replace(newTextNode);
  newTextNode.select(wordStartOffset, wordStartOffset);
};
