import { UrlFormatter } from '~shared/utils/url-formatter';

export class SimpleStickerNode {
  __src: string;
  __altText: string;
  __is_single: boolean;
  __is_emoji: boolean;
  __width: number;
  __shopItemDir: string;

  __height: number;

  constructor(
    src: string,
    is_emoji: boolean,
    shopItemDir: string,
    is_single?: boolean,
    altText: string = ''
  ) {
    const internalSrc = src.startsWith('http')
      ? UrlFormatter.fromMedia(src)
      : UrlFormatter.media(src);

    this.__shopItemDir = shopItemDir;
    this.__src = internalSrc as string;
    this.__is_single = is_single ?? false;
    this.__is_emoji = is_emoji;
    this.__altText = altText;
    this.__width = is_emoji ? 32 : 128;
    this.__height = is_emoji ? 32 : 128;
  }
}
