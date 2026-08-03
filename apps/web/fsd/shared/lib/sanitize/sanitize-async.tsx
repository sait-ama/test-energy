import deepmerge from 'deepmerge';
import type { Config } from 'dompurify';

import { DOMPURIFY_CONFIG } from './const';

export const sanitizeAsync = async (text: string, overrideConfig?: Config) => {
  const { default: DOMPurify } = await import('isomorphic-dompurify');
  return DOMPurify.sanitize(text, deepmerge(DOMPURIFY_CONFIG, overrideConfig ?? {}));
  // return parse(sanitized, {
  //     // @ts-ignore
  //     replace: (domNode) => {
  //         // @ts-ignore
  //         if (domNode.attribs && domNode.attribs.class) {
  //             // @ts-ignore
  //             const classList = domNode.attribs.class.split(' ') as string[];
  //
  //             const filteredClassList = classList.filter((className) => ALLOWED_CLASS_NAMES.includes(className));
  //
  //             if (filteredClassList.length === 0) {
  //                 return <></>;
  //             }
  //             // @ts-ignore
  //             domNode.attribs.class = filteredClassList.join(' ');
  //         }
  //     },
  // });
};
