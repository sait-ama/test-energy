import type { FC, ReactNode } from 'react';

import type { ContentTypes } from '~shared/config/constants';
import { getSiteConfig } from '~shared/config/site-config';

type DomainExclusiveProps = {
  children: ReactNode;
} & (
  | {
      only: ContentTypes | ContentTypes[];
    }
  | {
      exclude: ContentTypes | ContentTypes[];
    }
);

type ValidationOptions =
  | {
      only: ContentTypes | ContentTypes[];
    }
  | {
      exclude: ContentTypes | ContentTypes[];
    };

export const validateDomain = (options: ValidationOptions) => {
  const config = getSiteConfig()!;

  if (!config) return null;

  if ('only' in options) {
    let domains = options.only;
    if (!Array.isArray(options.only)) {
      domains = [options.only];
    }

    return domains.includes(config.contentType);
  }

  if ('exclude' in options) {
    let domains = options.exclude;
    if (!Array.isArray(options.exclude)) {
      domains = [options.exclude];
    }

    return !domains.includes(config.contentType);
  }

  throw new Error("You have to provide either 'only' or 'exclude' prop");
};

export const ContentTypeExclusive: FC<DomainExclusiveProps> = (props) => {
  const { children } = props;

  if (validateDomain(props)) {
    return children;
  }

  return null;
};
