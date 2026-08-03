import { getTranslations } from 'next-intl/server';

import { BulkFiltersDataById } from '~pages/catalog/lib/catalog-normalized-route';
import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import { CatalogPageV2 } from '~pages/catalog/ui/catalog-page-v2';
import { getTitlesFiltersOptions } from '~pages/catalog/ui/catalog-page-v2/features/title-filters/api/queries';
import { Type } from '~shared/api/models/forms';
import { getContentType, getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { createNormalizedParams } from '~shared/lib/routing/normalization';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NArray } from '~shared/utils/NArray';
import { toArray } from '~shared/utils/to-array';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const contentType = getContentType();
    const t = await getTranslations(`pages.catalog.meta.${contentType}`);
    const siteConfig = getSiteConfig()!;

    const filteredTypes = await getTitlesFiltersOptions()
      .then((data) => {
        const filteredTypes: Record<(typeof PATH_NORMALIZATION_SCHEMA)[number]['key'], Type[]> = {};

        const normalizedParams = createNormalizedParams(params?.slug, PATH_NORMALIZATION_SCHEMA);

        const bulkDataByDir: BulkFiltersDataById = {};
        for (const field in data) {
          bulkDataByDir[field] = NArray.newBy(data[field]).recordBy(
            (value) => value.dir,
            (value) => value
          );
        }

        const bulkDataById: BulkFiltersDataById = {};
        for (const field in data) {
          bulkDataById[field] = NArray.newBy(data[field]).recordBy(
            (value) => value.id,
            (value) => value
          );
        }

        Object.entries(normalizedParams).map(([key, idOrArr]) => {
          const asArray = toArray(idOrArr);

          asArray.forEach((id) => {
            const type = bulkDataByDir?.[key]?.[id] || bulkDataById?.[key]?.[id];

            if (type) {
              filteredTypes[key] = [...(filteredTypes[key] || []), type];
            }
          });
        });

        if (Object.entries(filteredTypes).length < 1) throw 1;

        return filteredTypes;
      })
      .catch(() => {
        return null;
      });

    const categories = filteredTypes?.categories?.map((v) => v.name)?.join(', ');
    const genres = filteredTypes?.genres?.map((v) => v.name)?.join(', ');

    const title = filteredTypes
      ? t('detailed-title', {
          fields: `${categories || 'категории'} / ${genres || 'жанры'}`,
        })
      : t('title');

    const description = filteredTypes
      ? t('detailed-description', {
          categories: categories || 'категории',
          genres: genres || 'жанры',
          siteName: siteConfig.site.name,
        })
      : t('description', {
          siteName: siteConfig.site.name,
        });

    const keywords = t('keywords');

    return generateNextMetadata({
      title,
      description,
      keywords,
    });
  }, 'title-catalog')
);

export default async function Catalog() {
  return <CatalogPageV2 />;
}
