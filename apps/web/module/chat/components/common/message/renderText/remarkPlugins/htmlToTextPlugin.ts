import type { Node } from 'unist';
import { visit, Visitor } from 'unist-util-visit';

const visitor: Visitor = (node) => {
  if (node.type !== 'html') return;

  node.type = 'text';
};
const transform = (tree: Node) => {
  visit(tree, visitor);
};

export const htmlToTextPlugin = () => transform;
