'use client';
import * as React from 'react';

import createPersistedState from 'use-persisted-state';

import { logger } from '~shared/lib/logger';

export const STORAGE_KEY = 'RE_APP_VERSION';

const defaultProps = {
  duration: 60 * 1000,
  auto: false,
  storageKey: STORAGE_KEY,
  basePath: '',
  filename: 'meta.json',
};

type OwnProps = {
  duration?: number;
  auto?: boolean;
  storageKey?: string;
  basePath?: string;
  filename?: string;
  children?: any;
};

type Result = {
  loading: boolean;
  isLatestVersion: boolean;
  emptyCacheStorage: (version?: string) => Promise<void>;
};

const VersionCacheContext = React.createContext<Result>({} as Result);

export const VersionCacheProvider: React.FC<OwnProps> = (props) => {
  const { children, ...otherProps } = props;
  const result = useClearCache(otherProps);
  return <VersionCacheContext.Provider value={result}>{children}</VersionCacheContext.Provider>;
};

let fetchCacheTimeout: any;

export const useClearCache = (props?: OwnProps) => {
  const { duration, auto, storageKey, basePath, filename } = {
    ...defaultProps,
    ...props,
  };
  const [loading, setLoading] = React.useState(true);
  const useAppVersionState = createPersistedState<string>(storageKey);
  const [appVersion, setAppVersion] = useAppVersionState('');
  const [isLatestVersion, setIsLatestVersion] = React.useState(true);
  const [latestVersion, setLatestVersion] = React.useState<string>(appVersion);

  async function setVersion(version: string) {
    setAppVersion(version);
  }

  const emptyCacheStorage = async (version?: string) => {
    if ('caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(
        cacheKeys.map((key) => {
          window.caches.delete(key);
        })
      );
    }

    await setVersion(version || latestVersion);
    window.location.replace(window.location.href);
  };

  const baseUrl = basePath.replace(/\/+$/, '') + '/' + filename;

  function fetchMeta() {
    try {
      fetch(baseUrl, {
        cache: 'no-store',
      })
        .then((response) => response.json())
        .then((meta) => {
          const newVersion = meta.version;
          const currentVersion = appVersion;
          const isUpdated = newVersion === currentVersion;
          if (!isUpdated && !auto) {
            setLatestVersion(newVersion);
            setLoading(false);
            if (appVersion) {
              setIsLatestVersion(false);
            } else {
              setVersion(newVersion);
            }
          } else if (!isUpdated && auto) {
            emptyCacheStorage(newVersion);
          } else {
            setIsLatestVersion(true);
            setLoading(false);
          }
        });
    } catch (err) {
      logger.error(err);
    }
  }

  React.useEffect(() => {
    fetchCacheTimeout = setInterval(() => fetchMeta(), duration);
    return () => {
      clearInterval(fetchCacheTimeout);
    };
  }, [loading]);

  const startVersionCheck = React.useRef(() => {});

  const stopVersionCheck = React.useRef(() => {});

  startVersionCheck.current = () => {
    if (window.navigator.onLine) {
      fetchCacheTimeout = setInterval(() => fetchMeta(), duration);
    }
  };

  stopVersionCheck.current = () => {
    clearInterval(fetchCacheTimeout);
  };

  React.useEffect(() => {
    window.addEventListener('focus', startVersionCheck.current);
    window.addEventListener('blur', stopVersionCheck.current);

    return () => {
      window.removeEventListener('focus', startVersionCheck.current);
      window.removeEventListener('blur', stopVersionCheck.current);
    };
  }, []);

  React.useEffect(() => {
    fetchMeta();
  }, []);

  return {
    loading,
    isLatestVersion,
    emptyCacheStorage,
    latestVersion,
  };
};
