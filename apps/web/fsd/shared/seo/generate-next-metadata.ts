import type { Metadata } from 'next';
// import { TemplateString } from 'next/dist/lib/metadata/types/metadata-types';
import { getTranslations } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';
import { appendSitename } from '~shared/seo/append-sitename';
import { UrlFormatter } from '~shared/utils/url-formatter';

// TODO: fix types with TemplateString
interface NextMetadataParams {
  title: string /* | TemplateString */;
  description?: string /* | TemplateString */;
  canonical?: string;
  og?: {
    type?: string;
    image?: string;
    alt?: string;
  };
  keywords?: string | string[];
  index?: boolean;
  follow?: boolean;
}

export const generateNextMetadata = async (params: NextMetadataParams) => {
  const domainConfig = getSiteConfig()!;
  const t = await getTranslations();

  const title = appendSitename(
    params.title ?? t(`pages.home.meta.${domainConfig.contentType}.title`)
  );
  const description =
    params.description ?? t(`pages.home.meta.${domainConfig.contentType}.description`);
  const keywords = params.keywords ?? t(`pages.home.meta.${domainConfig.contentType}.keywords`);

  const imageUrl = params.og?.image ?? domainConfig.seo.meta.defaultImage;
  const imageAlt = params.og?.alt ?? title;

  return {
    title,
    description,
    keywords,
    ...(params.canonical
      ? {
          alternates: {
            canonical: UrlFormatter.createUrl(domainConfig.routing.url, params.canonical),
          },
        }
      : {}),
    openGraph: {
      title,
      description,
      type: (params.og?.type ?? 'website') as any,
      images: [
        {
          url: imageUrl,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [imageUrl],
    },

    robots: {
      index: params.index ?? true,
      follow: params.follow ?? true,
      googleBot: {
        index: params.index ?? true,
        follow: params.follow ?? true,
      },
    },
  } satisfies Metadata;
};
