'use client';
import { CookieService } from '~shared/utils/cookie-service';

export type SourceExtractable = { source: Source; key: string | string[]; exact?: boolean };
export type SourceExtractableIsomoprphic = SourceExtractable | SourceExtractable[];
export type PathName = string;
export type IBugConfig = {
  base: SourceExtractableIsomoprphic;
} & Record<string, SourceExtractableIsomoprphic>;
export type Source = 'localStorage' | 'sessionStorage' | 'cookieStorage';
export type IStorable<E = unknown> = { get: (key: string, extra?: E) => string | null | undefined };

export const collectSettings = (rawPathName: string, config: IBugConfig) => {
  const pathName = rawPathName.split('?')[0]!;

  const wrappers: Record<Source, IStorable> = {
    localStorage: { get: (key: string) => window.localStorage.getItem(key) },
    sessionStorage: { get: (key: string) => window.sessionStorage.getItem(key) },
    cookieStorage: { get: (key) => CookieService.get(key) },
  };

  const results: Record<string, string> = {};

  const collectFromSource = (source: Source, key: string | string[]) => {
    const storage = wrappers[source];
    if (Array.isArray(key)) {
      for (const k of key) {
        const value = storage.get(k);
        if (value) {
          results[k] = value;
        }
      }
    } else {
      const value = storage.get(key);
      if (value) {
        results[key] = value;
      }
    }
  };

  const processConfig = (configItem: SourceExtractable) => {
    const { source, key, exact } = configItem;
    if (exact) {
      if ((key !== 'token' && pathName === key) || (Array.isArray(key) && key.includes(pathName))) {
        collectFromSource(source, key);
      }
    } else {
      if (
        (key !== 'token' && pathName.startsWith(key as string)) ||
        (Array.isArray(key) && key.some((k) => pathName.startsWith(k)))
      ) {
        collectFromSource(source, key);
      }
    }
  };

  const baseConfigs = Array.isArray(config.base) ? config.base : [config.base];
  for (const baseConfig of baseConfigs) {
    if (baseConfig.key !== 'token') collectFromSource(baseConfig.source, baseConfig.key);
  }

  for (const key of Object.keys(config)) {
    if (key !== 'base') {
      const configItems = Array.isArray(config[key]) ? config[key] : [config[key]];
      for (const configItem of configItems) {
        if (configItem) {
          processConfig(configItem);
        }
      }
    }
  }

  return results;
};
