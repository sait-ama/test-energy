'use client';
import { useTranslations } from 'next-intl';

import { Graph, WebPage, WebSite } from 'schema-dts';

import { useSiteConfig } from '~app/providers/site-config-provider';

export const RootLd = () => {
  const domainConfig = useSiteConfig();
  const t = useTranslations();

  const title = t(`pages.home.meta.${domainConfig.contentType}.title`);

  const description = t(`pages.home.meta.${domainConfig.contentType}.description`, {
    siteName: domainConfig.site.name,
  });

  const ldWebsite: WebSite = {
    '@id': `${domainConfig.routing.url}/#website`,
    '@type': 'WebSite',
    name: domainConfig.site.name,
    url: domainConfig.routing.url,
    inLanguage: domainConfig.localization.localeCode,
  };

  const ldWebpage: WebPage = {
    '@id': `${domainConfig.routing.url}/#webpage`,
    '@type': 'WebPage',
    description: description,
    name: title,
    url: domainConfig.routing.url,
    isPartOf: {
      '@id': `${domainConfig.routing.url}/#website`,
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [domainConfig.routing.url],
      },
    ],
  };

  const ldGraph: Graph = {
    '@context': 'https://schema.org',
    '@graph': [ldWebsite, ldWebpage],
  };

  return (
    <script
      id="root-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: `${JSON.stringify(ldGraph)}` }}
    />
  );
};
