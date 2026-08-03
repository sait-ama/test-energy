'use server';
import { cookies } from 'next/headers';

import { z } from 'zod';

import { logger } from '~shared/lib/logger';

import { TAGS_COOKIE_NAME, TAGS_COOKIE_VERSION } from './consts';

/**
 * ForumTagsStateExternal
 */
const schema = z.object({
  state: z.object({
    includes: z.number().array(),
    excludes: z.number().array(),
  }),
  version: z.number(),
});
const isStateLike = (state: unknown): state is z.infer<typeof schema> => {
  try {
    return !!schema.parse(state);
  } catch {
    return false;
  }
};
/***
 получить из куки {state.includes, state.exlcudes}  если невалидна схема или не совпадает версия TAGS_COOKIE_VERSION - undefined
 **/
export async function getServerStateFromCookieStore() {
  const cookieStore = await cookies();
  const forumTagsCookie = cookieStore.get(TAGS_COOKIE_NAME);

  if (forumTagsCookie) {
    try {
      const res = JSON.parse(forumTagsCookie.value);
      if (isStateLike(res)) {
        const hasValidVersion = Number(res.version) === TAGS_COOKIE_VERSION;
        if (hasValidVersion) return res.state;
        return undefined;
      }
      throw new Error(
        `cookie ${TAGS_COOKIE_NAME} version:${TAGS_COOKIE_VERSION} doesn't match schema {state:{includes:number[], excludes:number[]}}`
      );
    } catch (e: unknown) {
      logger.error(e, { scope: ['server'] });
      return undefined;
    }
  }
  return undefined;
}
