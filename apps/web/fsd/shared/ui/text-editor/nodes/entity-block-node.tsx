import { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DecoratorNode, DOMConversionMap, SerializedLexicalNode, Spread } from 'lexical';
import z from 'zod';

import { parseJson } from '~shared/utils/parse-json';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { CUSTOM_REMOVE_BLOCK_NODE } from '../commands';
import { ENTITY_NODE_TYPE } from './const';
import { EntityNodeViewContext } from './store';

export const parseEntityBlock = (json?: unknown | null) => {
  if (!json) return null;

  const validator = z.object({
    type: z.literal(ENTITY_NODE_TYPE.block),
    entity: z.string(),
    id: z.string().or(z.number()),
  });

  const r = validator.safeParse(json);

  if (!r.success) return null;

  return r.data;
};

export interface EntityBlockNodeViewProps {
  nodetype: string;
  entity: string;
  entityId: string;
  model: any;
  ctx: EntityBlockNode;
}

export const EntityBlockNodeView = ({
  nodetype,
  entity,
  entityId,
  model,
  ctx,
}: EntityBlockNodeViewProps) => {
  const { renderNode, models } = useStrictContext(EntityNodeViewContext);
  const [editor] = useLexicalComposerContext();

  const handleRemove = () => {
    if (!ctx) return;

    editor.dispatchCommand(CUSTOM_REMOVE_BLOCK_NODE, { key: ctx.getInnerId() });
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

export type SerializedEntityBlockNode = Spread<
  {
    type: string;
    version: 1;
    entityId: string;
    entity: string;
  },
  SerializedLexicalNode
>;

export class EntityBlockNode extends DecoratorNode<JSX.Element> {
  __entity_id: string;
  __entity: string;
  __model: any;
  static __node_type = ENTITY_NODE_TYPE.block;

  static getType(): string {
    return EntityBlockNode.__node_type;
  }

  static clone(node: EntityBlockNode): EntityBlockNode {
    return new EntityBlockNode(
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
    return document.createElement('div');
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(serializedNode: SerializedEntityBlockNode): EntityBlockNode {
    const { entityId, entity } = serializedNode;
    return new EntityBlockNode({ entity, entityId });
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

        const data = parseEntityBlock(parseJson(domNode.innerHTML));

        if (!data) return null;

        const { entity, id } = data;

        return {
          conversion: () => ({ node: new EntityBlockNode({ entity: entity, entityId: id }) }),
          priority: 1,
        };
      },
    };
  }

  exportJSON(): SerializedEntityBlockNode {
    return {
      type: EntityBlockNode.__node_type,
      version: 1,
      entity: this.__entity,
      entityId: this.__entity_id,
    };
  }

  decorate(): JSX.Element {
    return (
      <EntityBlockNodeView
        nodetype={EntityBlockNode.__node_type}
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
      type: EntityBlockNode.__node_type,
    };

    element.innerHTML = JSON.stringify(data);
    return { element };
  }

  isInline(): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  canInsertTextAfter(): boolean {
    return true;
  }

  getInnerId(): string {
    return this.__key;
  }
}
