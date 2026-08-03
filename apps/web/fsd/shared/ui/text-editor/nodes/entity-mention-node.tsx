import { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DecoratorNode, DOMConversionMap, SerializedLexicalNode, Spread } from 'lexical';
import z from 'zod';

import { parseJson } from '~shared/utils/parse-json';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { CUSTOM_REMOVE_MENTION_NODE } from '../commands';

import { ENTITY_NODE_TYPE } from './const';
import { EntityNodeViewContext } from './store';

export const parseEntityMention = (json?: unknown) => {
  if (!json) return null;

  const validator = z.object({
    type: z.literal(ENTITY_NODE_TYPE.mention),
    entity: z.string(),
    id: z.string().or(z.number()),
  });

  const r = validator.safeParse(json);

  if (!r.success) return null;

  return r.data;
};

export interface EntityMentionNodeViewProps {
  nodetype: string;
  entity: string;
  entityId: string;
  model: any;
  ctx: EntityMentionNode;
}

export const EntityMentionNodeView = ({
  nodetype,
  entity,
  entityId,
  model,
  ctx,
}: EntityMentionNodeViewProps) => {
  const { renderNode, models } = useStrictContext(EntityNodeViewContext);
  const [editor] = useLexicalComposerContext();

  const handleRemove = () => {
    if (!ctx) return;

    editor.dispatchCommand(CUSTOM_REMOVE_MENTION_NODE, { key: ctx.getInnerId() });
  };

  return renderNode({
    nodetype,
    entity,
    entityId,
    model,
    models,
    remove: handleRemove,
  });
};

export type SerializedEntityMentionNode = Spread<
  {
    type: string;
    version: 1;
    entityId: string;
    entity: string;
  },
  SerializedLexicalNode
>;

export class EntityMentionNode extends DecoratorNode<JSX.Element> {
  __entity_id: string;
  __entity: string;
  __model: any;
  static __node_type = ENTITY_NODE_TYPE.mention;

  static getType(): string {
    return EntityMentionNode.__node_type;
  }

  static clone(node: EntityMentionNode): EntityMentionNode {
    return new EntityMentionNode(
      { entity: node.__entity, entityId: node.__entity_id, model: node.__model },
      node.__key
    );
  }

  constructor(opts: { entityId: string; entity: string; model?: any }, key?: string) {
    const { entityId, entity, model } = opts;

    super(key);
    this.__entity_id = entityId;
    this.__entity = entity;
    this.__model = model;
  }

  createDOM(): HTMLElement {
    const elem = document.createElement('span');
    return elem;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedEntityMentionNode): EntityMentionNode {
    const { entityId, entity } = serializedNode;
    return new EntityMentionNode({ entity, entityId });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      renode: (domNode: Node) => {
        if (
          !(domNode instanceof HTMLElement) ||
          domNode.nodeName.toLowerCase() !== 'renode' ||
          domNode.getAttribute('nodetype') !== 'json'
        )
          return null;

        const data = parseEntityMention(parseJson(domNode.innerHTML));
        if (!data) return null;

        const { entity, id } = data;

        return {
          conversion: () => ({ node: new EntityMentionNode({ entity: entity, entityId: id }) }),
          priority: 1,
        };
      },
    };
  }

  exportJSON(): SerializedEntityMentionNode {
    return {
      type: EntityMentionNode.__node_type,
      version: 1,
      entity: this.__entity,
      entityId: this.__entity_id,
    };
  }

  decorate(): JSX.Element {
    return (
      <EntityMentionNodeView
        nodetype={EntityMentionNode.__node_type}
        entity={this.__entity}
        entityId={this.__entity_id}
        model={this.__model}
        ctx={this}
      />
    );
  }

  exportDOM(): { element: HTMLElement } {
    const element = document.createElement('renode');
    element.setAttribute('nodetype', 'json');

    const data = {
      entity: this.__entity,
      id: this.__entity_id,
      type: EntityMentionNode.__node_type,
    };

    element.innerHTML = JSON.stringify(data);
    return { element };
  }

  isInline(): boolean {
    return true;
  }

  getInnerId(): string {
    return this.__key;
  }
}
