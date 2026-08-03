import { RefObject } from 'react';

import { createCommand, DecoratorNode, TextNode } from 'lexical';

// --> link
export const CUSTOM_LINK_CLICK_COMMAND = createCommand<string>();

// --> mention

//
export const CUSTOM_CREATE_MENTION = createCommand<{
  type: string;
  replaceNode?: TextNode | null;
} | null>();

//
export const CUSTOM_CREATE_MENTION_NODE = createCommand<{
  type: string;
  id: string;
  replaceNode?: DecoratorNode<unknown> | null;
  model: unknown;
}>();

export const CUSTOM_REMOVE_MENTION_NODE = createCommand<{
  nodeRef?: TextNode;
  key: string;
}>();

// --> popover
export const CUSTOM_TRIGGER_POPOVER = createCommand<{ ref: RefObject<unknown>; type: string }>();

export const CUSTOM_CREATE_BLOCK_NODE = createCommand<{
  type: string;
  id: string;
  nodetype: string;
  model?: unknown;
  replaceNode?: DecoratorNode<unknown> | null;
}>();

export const CUSTOM_REMOVE_BLOCK_NODE = createCommand<{
  key: string;
  replaceNode?: DecoratorNode<unknown> | null;
}>();
