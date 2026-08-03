import { RedisStringsHandler } from '@trieb.work/nextjs-turbo-redis-cache';

let cachedHandler;

class CustomizedCacheHandler {
  constructor() {
    if (!cachedHandler) {
      cachedHandler = new RedisStringsHandler({
        // eslint-disable-next-line no-undef
        redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
        database: 0,
        // eslint-disable-next-line no-undef
        keyPrefix: process.env.REDIS_PREFIX ?? 're:',
        timeoutMs: 2_000,
        revalidateTagQuerySize: 500,
        sharedTagsKey: '__sharedTags__',
        avgResyncIntervalMs: 10_000 * 60,
        redisGetDeduplication: true,
        inMemoryCachingTime: 0,
        defaultStaleAge: 1209600,
        estimateExpireAge: (staleAge) => staleAge * 2,
      });
    }
  }

  get(...args) {
    return cachedHandler.get(...args);
  }

  set(...args) {
    return cachedHandler.set(...args);
  }

  revalidateTag(...args) {
    return cachedHandler.revalidateTag(...args);
  }

  resetRequestCache(...args) {
    return cachedHandler.resetRequestCache(...args);
  }
}

export default CustomizedCacheHandler;
