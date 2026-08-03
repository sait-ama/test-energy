import { ENTITY_NODE_TYPE } from '~shared/ui/text-editor/nodes/const';

import { BlockEditorView } from './block';
import { MentionEditorView } from './mention';

export type EntityResolverOptions = {
  nodetype: string;
  entity: string;
  entityId: string;
  model: any;
  models: Record<string, any>;
  remove: () => void;
};

export const entityResolver = (opts: EntityResolverOptions) => {
  if (opts.nodetype === ENTITY_NODE_TYPE.mention) {
    return <MentionEditorView {...opts} />;
  }

  if (opts.nodetype === ENTITY_NODE_TYPE.block) {
    return <BlockEditorView {...opts} />;
  }

  return null;
};
