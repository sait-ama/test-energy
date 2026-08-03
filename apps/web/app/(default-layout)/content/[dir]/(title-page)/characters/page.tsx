import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { TitleDetailPageTabs } from '~pages/(title)/title-detail/model/const';
import { getCurrentPageTitleDetail } from '~pages/(title)/title-detail/model/server';
import type { TitleDetailPageParams } from '~pages/(title)/title-detail/model/type';
import { CharactersContent } from '~pages/(title)/title-detail/ui/title-tabs/characters-content';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { isRussianRegExp } from '~shared/lib/regexp/is-russian';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const generateMetadata = fallbackDefaultMetadata<TitleDetailPageParams>(async (props) => {
  const { dir } = await props.params;

  return await withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.title-characters.meta.${siteConfig.contentType}`);

    const title = await getCurrentPageTitleDetail(dir);

    const coverUrl = UrlFormatter.media(title.cover.mid);

    // const shouldIndex = !title.is_erotic && !title.is_yaoi;

    const genres = title.genres
      .map((it) =>
        t('tag-keyword', {
          type: title.type.name.toLowerCase(),
          tag_type: 'genre',
          name: it.name.toLowerCase(),
        })
      )
      .join(', ');

    const categories = title.categories
      .map((it) =>
        t('tag-keyword', {
          type: title.type.name.toLowerCase(),
          tag_type: 'category',
          name: it.name.toLowerCase(),
        })
      )
      .join(', ');

    return generateNextMetadata({
      title: t('title', {
        name: title.main_name,
        type: title.type.name,
        count_characters: title.count_characters,
      }),
      description: t('description', {
        main_name: title.main_name,
        description: (title.description || '')
          .replace(htmlRegExp, '')
          .split('.')
          .slice(0, 2)
          .join('.'),
        count_characters: title.count_characters,
        genres: title.genres
          .map((it) => it.name.toLowerCase())
          .slice(0, 5)
          .join(', '),
        type: title.type.name.toLowerCase(),
      }),
      og: {
        image: coverUrl,
        alt: t('title', {
          name: title.main_name,
          type: title.type.name,
          count_characters: title.count_characters,
        }),
      },
      keywords: t('keywords', {
        main_name: title.main_name,
        type: title.type.name.toLowerCase(),
        another_name: [title.secondary_name, ...title.another_name.split('/')]
          .map((it) => it.trim())
          .sort((a, b) => Number(isRussianRegExp(a)) - Number(isRussianRegExp(b)))
          .join(', '),
        genres,
        categories,
        last_chapter: title.count_chapters,
      }),
      canonical: Routing.Title.detail({
        params: { dir, content: siteConfig.contentType, tab: TitleDetailPageTabs.CHARACTERS },
      }),
      // index: shouldIndex,
      // follow: shouldIndex,
    });
  }, `title-characters-${dir}`)(props);
});

export default async function CharactersPage() {
  return (
    <Suspense fallback={null}>
      <CharactersContent {...TestProps.id(`title-tab-content-${TitleDetailPageTabs.CHARACTERS}`)} />
    </Suspense>
  );
}
