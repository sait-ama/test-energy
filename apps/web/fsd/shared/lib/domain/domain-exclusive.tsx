'use client';
import type { FC, ReactNode } from 'react';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { SiteConfig, SiteNames } from '~shared/config/constants';

type DomainExclusiveProps = {
  children: ReactNode;
} & (
  | {
      only: SiteNames | SiteNames[];
    }
  | {
      exclude: SiteNames | SiteNames[];
    }
);

type ValidationOptions = { config: SiteConfig } & (
  | {
      only: SiteNames | SiteNames[];
    }
  | {
      exclude: SiteNames | SiteNames[];
    }
);

export const validateDomain = (options: ValidationOptions) => {
  const { config } = options;

  if (!config) return null;

  if ('only' in options) {
    let domains = options.only;
    if (!Array.isArray(options.only)) {
      domains = [options.only];
    }

    return domains.includes(config.site.name);
  }

  if ('exclude' in options) {
    let domains = options.exclude;
    if (!Array.isArray(options.exclude)) {
      domains = [options.exclude];
    }

    return !domains.includes(config.site.name);
  }

  throw new Error("You have to provide either 'only' or 'exclude' prop");
};

export const DomainExclusive: FC<DomainExclusiveProps> = (props) => {
  const { children } = props;
  const siteConfig = useSiteConfig();

  if (validateDomain({ config: siteConfig, ...props })) {
    return children;
  }

  return null;
};
