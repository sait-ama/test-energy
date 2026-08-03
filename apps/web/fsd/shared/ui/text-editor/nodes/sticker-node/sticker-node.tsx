import { ReactNode } from 'react';

import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import type { EditorConfig, Spread } from 'node_modules/lexical/LexicalEditor';

import { cn } from '@re/ui-kit/utils/cn';

import { logger } from '~shared/lib/logger';
import { StickersClasses } from '~shared/ui/text-editor/nodes/sticker-node/types';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface StickerPayload {
  src: string;
  altText?: string;
  is_emoji: boolean;
  is_single?: boolean;
  shopItemDir: string;
  key?: NodeKey;
}

export type SerializedStickerNode = Spread<
  {
    src: string;
    altText?: string;
    is_emoji: boolean;
    is_single: boolean;
    width?: number;
    shopItemDir: string;
    height?: number;
  },
  SerializedLexicalNode
>;

export class StickerNode extends DecoratorNode<ReactNode> {
  __src: string;
  __altText: string;
  __is_emoji: boolean;
  __width: number;
  __shopItemDir: string;
  __is_single: boolean;

  __height: number;

  constructor(
    src: string,
    is_emoji: boolean,
    shopItemDir: string,
    is_single?: boolean,
    altText: string = '',
    key?: NodeKey
  ) {
    const internalSrc = src.startsWith('http') ? UrlFormatter.fromMedia(src) : src;

    super(key);
    this.__is_single = is_single ?? false;

    this.__shopItemDir = shopItemDir;
    this.__src = internalSrc;
    this.__is_emoji = is_emoji;
    this.__altText = altText;
    this.__width = is_emoji ? 32 : 128;
    this.__height = is_emoji ? 32 : 128;
  }

  static getType(): string {
    return 'sticker';
  }

  static clone(node: StickerNode): StickerNode {
    return new StickerNode(
      node.__src,
      node.__is_emoji,
      node.__shopItemDir,
      node.__is_single,
      node.__altText,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedStickerNode): StickerNode {
    return new StickerNode(
      serializedNode.src,
      serializedNode.is_emoji,
      serializedNode.shopItemDir,
      serializedNode.is_single,
      serializedNode.altText
    );
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => {
        const img = node as HTMLImageElement;

        if (!img.classList.contains('sticker')) return null;

        let src = img.src;
        try {
          if (src.startsWith('http')) {
            src = UrlFormatter.fromMedia(src);
          }
        } catch {
          logger.error(`Invalid media URL:${img.src}`, { scope: ['local'] });
          return null;
        }

        const isEmoji = img.classList.contains('sticker-emoji');
        const isSingle = img.classList.contains('sticker-single');
        const shopDir = img.dataset.shopItemDir || 'openStickers';
        return {
          conversion: () => ({
            node: new StickerNode(src, isEmoji, shopDir, isSingle, img.alt),
          }),
          priority: 1,
        };
      },
    };
  }

  exportJSON(): SerializedStickerNode {
    console.log('exportJSON');

    return {
      type: 'sticker',
      version: 1,
      is_single: this.__is_single,
      src: this.__src,
      altText: this.__altText,
      is_emoji: this.__is_emoji,
      shopItemDir: this.__shopItemDir,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.src = this.__src;
    element.alt = this.__altText;
    element.className = cn(
      StickersClasses.BASE,
      { [StickersClasses.EMOJI]: this.__is_emoji },
      { [StickersClasses.SINGLE_STICKER]: this.__is_single }
    );
    element.dataset.shopItemDir = this.__shopItemDir;
    // element.dataset.originalSrc = this.__src;
    return { element };
  }

  createDOM(_: EditorConfig): HTMLElement {
    const element = document.createElement('img');
    // element.dataset.originalSrc = this.__src;
    element.src = UrlFormatter.media(this.__src);
    element.alt = this.__altText;

    element.dataset.shopItemDir = String(this.__shopItemDir);
    element.className = cn(
      `${StickersClasses.BASE} inline-flex object-contain`,
      { [`${StickersClasses.EMOJI} w-[24px] h-[24px]`]: this.__is_emoji },
      { [`${StickersClasses.SINGLE_STICKER} w-32 h-32`]: this.__is_single }
    );

    // element.className = `sticker ${this.__is_emoji ? 'sticker-emoji w-[18px] h-[18px] ' : ` ${this.__is_single ? 'sticker-single ' : ''} w-32 h-32`} inline-block object-contain`;

    return element;
  }

  updateDOM(prevNode: StickerNode): boolean {
    const needsUpdate =
      prevNode.__src !== this.__src ||
      prevNode.__altText !== this.__altText ||
      prevNode.__is_emoji !== this.__is_emoji ||
      prevNode.__shopItemDir !== this.__shopItemDir;

    if (needsUpdate) {
      const element = this.getDOM() as HTMLImageElement;
      if (needsUpdate) {
        const element = this.getDOM() as HTMLImageElement;
        element.src = UrlFormatter.media(this.__src);
        element.dataset.shopItemDir = this.__shopItemDir;
        element.alt = this.__altText;
      }
      element.className = cn(
        `${StickersClasses.BASE} inline-flex object-contain`,
        { [`${StickersClasses.EMOJI} w-[24px] h-[24px]`]: this.__is_emoji },
        { [`${StickersClasses.SINGLE_STICKER} w-32 h-32`]: this.__is_single }
      );

      // element.className = `sticker ${this.__is_emoji ? 'sticker-emoji w-[18px] h-[18px]' : ` ${this.__is_single ? 'sticker-single ' : ''} w-32 h-32`} inline-block object-contain`;
    }
    return needsUpdate;
  }

  getDOM(): HTMLImageElement {
    // @ts-ignore
    return super.getDOM() as HTMLImageElement;
  }

  decorate(): ReactNode {
    return <></>;
  }
}

export function $createStickerNode(payload: StickerPayload): StickerNode {
  const processedSrc = payload.src.startsWith('http')
    ? UrlFormatter.fromMedia(payload.src)
    : payload.src;
  return $applyNodeReplacement(
    new StickerNode(
      processedSrc,
      payload.is_emoji,
      payload.shopItemDir,
      payload.is_single,
      payload.altText,
      payload.key
    )
  );
}

export function $isStickerNode(node: LexicalNode | null | undefined): node is StickerNode {
  return node instanceof StickerNode;
}
