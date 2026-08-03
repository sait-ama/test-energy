'use server';
import { getTranslations } from 'next-intl/server';

import { v2ForumTagsRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { v2ForumSearchRetrieve } from '@re/api/generated/sdk.gen';
import { PostEntity } from '@re/api/generated/types.gen';

import { getAuthorBuilder, mergeAuthorsObject } from '~entities/post/model/utils';
import { client } from '~shared/api/client';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { logger } from '~shared/lib/logger';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { appendSitename } from '~shared/seo/append-sitename';
import {
  DiscussionForumPostingBuilder,
  EntryPointBuilder,
  ImageObjectBuilder,
  ItemListBuilder,
  ListItemBuilder,
  OrganizationBuilder,
  SearchActionBuilder,
  ThingBuilder,
  WebPageBuilder,
  WebSiteBuilder,
} from '~shared/seo/schema-org';
import { createInteractionCounter } from '~shared/seo/utils';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const ForumJsonLdAsync = async ({
  search = '',
  ordering = '-id',
  excludeTags = [],
  tags = [],
  week = false,
  titleId,
}: {
  week?: boolean;
  search?: string;
  ordering?: 'id' | '-id' | '-score' | 'week';
  titleId?: string | number;
  tags?: number[];
  excludeTags: number[];
}) => {
  const siteConfig = getSiteConfig()!;
  const queryClient = getQueryClient();
  const [tMeta, tMetaByContentType] = await Promise.all([
    getTranslations('pages.forum.meta'),
    getTranslations(`pages.forum.meta.${siteConfig?.contentType || 'manga'}`),
  ]);

  const forumBaseUrl = `${siteConfig.routing.url}/${Routing.Forum.Feed.base}`;
  const forumUrl = `${siteConfig.routing.url}${Routing.Forum.Feed.get({ query: {} })}`;
  const [forumResponse = [], { results: allTags = [] } = {}] = await Promise.all([
    v2ForumSearchRetrieve({
      throwOnError: true,
      query: {
        ...(ordering === 'week' ? {} : { ordering }),
        search,
        tags,
        exclude_tag: excludeTags,
        week: ordering === 'week' || week,
        title_id: titleId ? Number(titleId) : undefined,
      },
      client,
      cache: 'force-cache',
      next: { revalidate: 60 * 60 * 4, tags: ['forum-json-ld-feed-search'] },
    })
      // @ts-ignore todo schema
      .then((v) => v.data.results)
      .catch((e) => {
        logger.error(e, { scope: ['forum', 'server', 'json-ld'] });
        return undefined;
      }),
    queryClient
      .fetchQuery(
        v2ForumTagsRetrieveOptions({
          client,
          cache: 'force-cache',
          next: { revalidate: 60 * 60 * 24, tags: ['forum-json-ld-tags-week'] },
        })
      )
      .catch((e) => {
        logger.error(e, { scope: ['forum', 'server', 'json-ld'] });
        return undefined;
      }),
  ]);
  const posts = deduplicate(forumResponse ?? [], (v) => v.id);

  const buildPostSchema = (post: PostEntity) => {
    const postUrl = `${siteConfig.routing.url}${Routing.Forum.ByDir.get({ params: { dir: post.dir } })}`;

    return new DiscussionForumPostingBuilder()
      .set({
        '@id': postUrl,
        headline: post.header,
        author: getAuthorBuilder(
          siteConfig,
          mergeAuthorsObject(post.author_user, post.author_publisher, post.author_club)
        ).build(),
        datePublished: post.created_at,
        dateModified: post.created_at,
        articleBody: post.text?.replace(htmlRegExp, '').trim().slice(0, 300) || '',
        image: post.attachment?.mid
          ? new ImageObjectBuilder()
              .set({
                url: UrlFormatter.media(post.attachment.mid),
                description: tMeta('attachment-alt'),
                width: '800',
                height: '600',
              })
              .build()
          : undefined,
        interactionStatistic: [
          createInteractionCounter('CommentAction', post.count_comments),
          createInteractionCounter('LikeAction', post.score),
        ],
        keywords: post.tags.map((t) => t.name),
        url: postUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': postUrl,
        },
      })
      .build();
  };

  const buildSchema = () => {
    const publisher = new OrganizationBuilder()
      .set({
        name: siteConfig.site.name,
        logo: new ImageObjectBuilder()
          .set({
            url: `${siteConfig.routing.url}/icons/android-chrome-192x192.png`,
            height: '192',
          })
          .build(),
      })
      .build();

    const postsList = new ItemListBuilder()
      .set({
        name: tMeta('feed'),
        numberOfItems: posts.length,
        itemListElement: posts.map((post, index) =>
          new ListItemBuilder()
            .set({
              position: index + 1,
              item: buildPostSchema(post),
            })
            .build()
        ),
      })
      .build();

    const tagsList = new ItemListBuilder()
      .set({
        name: tMeta('top-tags.title'),
        numberOfItems: allTags.length,
        description: tMeta('top-tags.description'),
        itemListElement: allTags.map((tag, index) =>
          new ListItemBuilder()
            .set({
              position: index + 1,
              item: new ThingBuilder()
                .set({
                  '@id': `${siteConfig.routing.url}/${Routing.Forum.Feed.get({ query: { tags: [tag.id] } })}`,
                  name: tag.name,
                  description: tag.description,
                })
                .build(),
            })
            .build()
        ),
      })
      .build();

    const forumPage = new WebPageBuilder()
      .set({
        isPartOf: new WebSiteBuilder()
          .set({
            name: siteConfig.site.name,
            url: siteConfig.routing.url,
          })
          .build(),
        '@id': forumUrl,
        name: appendSitename(tMetaByContentType('title')),
        description: tMetaByContentType('description', { siteName: siteConfig.site.name }),
        publisher,
        mainEntity: [postsList, tagsList],
        potentialAction: new SearchActionBuilder()
          .set({
            //   @ts-ignore
            'query-input': 'required name=search_term_string',
            target: new EntryPointBuilder()
              .set({
                urlTemplate: `${forumBaseUrl}?search={search_term_string}`,
              })
              .build(),
          })
          .build(),
      })
      .build();

    return {
      '@context': 'https://schema.org',
      '@graph': [forumPage],
    };
  };

  const schema = JSON.stringify(buildSchema(), null, 2);
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />;
};
