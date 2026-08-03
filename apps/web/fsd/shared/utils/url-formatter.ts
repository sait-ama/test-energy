import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

import { stringify } from 'query-string';

import { removeUnusedQueryParams } from '@re/core/lib/query-params';

import { isStaticImport } from '~shared/types/next';

import { publicEnv } from './env';
import { toArray } from './to-array';

export class UrlBuilder {
  private url: string;
  private params: Record<NumberIsomorphic, NumberIsomorphic | null | undefined> = {};

  constructor(...parts: (NumberIsomorphic | undefined)[]) {
    this.url = UrlFormatter.createUrl(...parts);
  }

  add(part: string | number) {
    let url = UrlFormatter.createUrl(this.url, part);
    if (!url.endsWith('/')) {
      url += '/';
    }
    this.url = url;
    return this;
  }

  addNormalizedParams(
    params?: Record<string, SingleOrMultiOf<string | number | null | undefined>> | null
  ) {
    if (!params) return this;

    Object.entries(params).forEach(([key, value]) => {
      const valueAsArr = toArray(value).filter(Boolean);

      if (!valueAsArr.length) return;
      this.add(key).add(valueAsArr.join(','));
    });

    return this;
  }

  query<T>(params: T) {
    this.params = { ...this.params, ...params };
    return this;
  }

  build() {
    return UrlFormatter.addQuery(this.url, this.params);
  }
}

export class UrlFormatter {
  static createUrl = (...parts: (QueryPrimitive | undefined)[]) =>
    parts
      .filter((item) => !!item)
      .join('/')
      .replace(/([^:]\/)\/+/g, '$1');

  static addQuery = (
    url: string,
    query: Record<NumberIsomorphic, NumberIsomorphic | NumberIsomorphic[] | undefined | null>
  ) => {
    const stringified = stringify(query ? removeUnusedQueryParams(query) : query);

    return stringified ? `${url}?${stringified}` : url;
  };

  static media = <
    T extends string | StaticImport | null | undefined = string | StaticImport | null | undefined,
  >(
    imgSrc: T
  ) => {
    if (!imgSrc) return '';
    if (typeof imgSrc === 'string') {
      if (!imgSrc?.length && !imgSrc?.src?.length) return '';
    }
    if (isStaticImport(imgSrc)) return imgSrc;
    if (imgSrc?.includes?.('data:') || imgSrc?.includes?.('blob:')) return imgSrc;

    if (
      imgSrc?.includes?.(publicEnv('MEDIA_URL')) ||
      imgSrc?.startsWith?.('https://') ||
      imgSrc?.startsWith?.('http://')
    )
      return imgSrc;

    const srcWithMedia: string =
      publicEnv('MEDIA_URL')?.includes?.('test') ||
      imgSrc?.startsWith?.('/media') ||
      imgSrc?.startsWith?.('media')
        ? imgSrc
        : UrlFormatter.createUrl('/media/', imgSrc);
    return UrlFormatter.createUrl(publicEnv('MEDIA_URL'), srcWithMedia);
  };
  static fromMedia(url: string): string {
    const mediaUrl = publicEnv('MEDIA_URL');

    const fullMediaPrefix = `${mediaUrl}/media/`;

    if (url.startsWith(fullMediaPrefix)) {
      return url.slice(fullMediaPrefix.length).replace(/^\/+/g, '');
    }

    const mediaPartIndex = url.indexOf('/media/');
    if (mediaPartIndex > -1) {
      return url.slice(mediaPartIndex + '/media/'.length).replace(/^\/+/g, '');
    }

    return url.replace(/^\/+/g, '');
  }
}
