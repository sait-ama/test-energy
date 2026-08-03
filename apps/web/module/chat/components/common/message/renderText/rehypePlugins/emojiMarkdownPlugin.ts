import emojiRegex from 'emoji-regex';
import { findAndReplace, ReplaceFunction } from 'hast-util-find-and-replace';
// @ts-expect-error
import type { Nodes } from 'hast-util-find-and-replace/lib';
import { u } from 'unist-builder';

export const emojiMarkdownPlugin = () => {
  const replace: ReplaceFunction = (match) =>
    u('element', { properties: {}, tagName: 'emoji' }, [u('text', match)]);

  const transform = (node: Nodes) => findAndReplace(node, [emojiRegex(), replace]);

  return transform;
};
