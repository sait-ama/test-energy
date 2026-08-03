import { createContext, Dispatch, ReactNode, SetStateAction, useMemo, useState } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TextNode } from 'lexical';

import { CUSTOM_CREATE_MENTION_NODE } from '~shared/ui/text-editor/commands';
import { ENTITY_NODE_TYPE } from '~shared/ui/text-editor/nodes/const';

import { MentionType } from './const';
import { getMentionType } from './utils';

export type MentionSchema = { type: string; replaceNode?: TextNode | null };

export interface MentionContextSchema {
  mention: MentionSchema | null;
  setMention: Dispatch<SetStateAction<{ type: string } | null>>;
  parsedMention: {
    type: MentionType | 'indefinite';
    id: string | null;
  } | null;
  handleSubmit: (type: string, id: string, model: unknown) => void;
}

export const MentionContext = createContext<MentionContextSchema | null>(null);

export interface MentionProviderProps {
  children: ReactNode;
}

export const MentionProvider = ({ children }: MentionProviderProps) => {
  const [editor] = useLexicalComposerContext();

  const [mention, setMention] = useState<{ type: string; replaceNode?: TextNode | null } | null>(
    null
  );
  const parsedMention = useMemo(() => getMentionType(mention?.type), [mention]);

  const handleSubmit = (type: string, id: string, model: unknown) => {
    if (!mention) return;

    editor.dispatchCommand(CUSTOM_CREATE_MENTION_NODE, {
      type,
      id,
      nodetype: ENTITY_NODE_TYPE.mention,
      replaceNode: mention.replaceNode,
      model,
    });
  };

  const context: MentionContextSchema = {
    mention,
    setMention,
    parsedMention,
    handleSubmit,
  };
  return <MentionContext.Provider value={context}>{children}</MentionContext.Provider>;
};
