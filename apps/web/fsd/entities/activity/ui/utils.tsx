import type { ReactElement } from 'react';

import { UrlFormatter } from '~shared/utils/url-formatter';

export const getColorByScore = (score: number) => {
  if (score >= 500) return '#E0115F';
  if (score >= 200) return '#b9f2ff';
  if (score >= 100) return 'gold';
  if (score >= 50) return 'silver';
  if (score >= 20) return '#cd7f32';
  return 'unset';
};

export function fillBetweenArrayItems<Arr extends unknown[]>(array: Arr, itemToFill: ReactElement) {
  const newArray: Arr[number][] = [];

  for (let i = 0; i < array.length; i++) {
    newArray.push(array[i]);

    if (i === array.length - 1) break;
    newArray.push(itemToFill);
  }

  return newArray;
}

const htmlEntitiesDict: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&copy;': '©',
  '&reg;': '®',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&deg;': '°',
  '&nbsp;': String.fromCharCode(160),
};

export function replaceHtmlEntities(str: string) {
  const processed = str.replace(
    /<img\s+([^>]*?class\s*=\s*['"]sticker['"][^>]*?)src\s*=\s*['"]([^'"]+)['"]([^>]*?)\/?>/gi,
    (_, attrsBefore, src, attrsAfter) => {
      const newSrc = UrlFormatter.media(src);
      return `<img ${attrsBefore} src='${newSrc}'${attrsAfter} />`;
    }
  );

  let plainText = '';
  let entity: string | null = null;
  let inTag = false;

  for (const char of processed) {
    if (char === '<') inTag = true;
    if (char === '>') inTag = false;

    if (inTag) {
      plainText += char;
      continue;
    }

    if (char === '&' && !entity) {
      entity = '&';
      continue;
    }

    if (entity) {
      entity += char;
      if (char === ';') {
        plainText += htmlEntitiesDict[entity] ?? entity;
        entity = null;
      }
      continue;
    }

    plainText += char;
  }

  plainText += entity ?? '';

  plainText = plainText.replaceAll(/(<img\s+[^>]*?src=")([^"]*)("[^>]*>)/g, (_, p1, p2, p3) => {
    return `${p1}${UrlFormatter.media(p2)}${p3}`;
  });
  return plainText;
}
