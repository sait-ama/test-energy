'use server';
import { getTranslations } from 'next-intl/server';

import { v2ForumRetrieve2, v2ForumSearchRetrieve } from '@re/api/generated/sdk.gen';

import { ActivityRepository } from '~entities/activity/model/repository';
import { replaceHtmlEntities } from '~entities/activity/ui/utils';
import { getAuthorBuilder, mergeAuthorsObject } from '~entities/post/model/utils';
import { client } from '~shared/api/client';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import {
  ArticleBuilder,
  CommentBuilder,
  DiscussionForumPostingBuilder,
  ImageObjectBuilder,
  PersonBuilder,
  ThingBuilder,
} from '~shared/seo/schema-org';
import {
  AnchorLinks,
  createAnchorUrl,
  createCommentAction,
  createEntityAnchor,
  createImageObject,
  createInteractionCounter,
  createMainEntityOfPage,
  createPublisher,
} from '~shared/seo/utils';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const PostJsonLdAsync = async ({ dir }: { dir: string }) => {
  const [post, topPostsPages, t, tReusable] = await Promise.all([
    v2ForumRetrieve2({
      path: { dir },
      client,
    }).then((v) => v.data!),
    v2ForumSearchRetrieve({
      query: { tags: [], exclude_tag: [], search: '', week: true },
      client,
      cache: 'force-cache',
    }).then((v) => v.data!),
    getTranslations('pages.forum-post.meta.jsonld'),
    getTranslations('reusable.json-ld'),
  ]);
  const commentsData = await ActivityRepository.list({
    query: { post_id: post.id, count: 20, page: 1 },
  });
  const siteConfig = getSiteConfig()!;
  const postUrl = `${siteConfig.routing.url}${Routing.Forum.ByDir.get({ params: { dir } })}`;
  const postAuthor = mergeAuthorsObject(post.author_user, post.author_publisher, post.author_club);

  const image = post.attachment?.mid
    ? createImageObject(UrlFormatter.media(post.attachment.mid), post.header, post.header)
    : undefined;

  const commentBuilders = (commentsData?.results || []).map((comment) => {
    if (!comment) return null;

    const commentDate =
      typeof comment.date === 'number'
        ? new Date(Date.now() - Number(comment.date)).toISOString()
        : comment.date;

    if (!commentDate || !comment.left_by?.name) return null;

    return new CommentBuilder()
      .set({
        author: new PersonBuilder()
          .set({
            agentInteractionStatistic: createInteractionCounter(
              'WriteAction',
              comment.rated ? 1 : 0
            ),
            name: comment?.user?.username || comment.left_by.name,
            url: Routing.User.detail({ params: { id: comment.left_by.id! } }),
          })
          .build(),
        text: replaceHtmlEntities(comment.text).replace(htmlRegExp, '').trim(),
        datePublished: commentDate,
        upvoteCount: comment.score,
        url: createAnchorUrl(postUrl, createEntityAnchor(AnchorLinks.Comment, comment.id)),
      })
      .build();
  });

  const interactionStats = [
    createInteractionCounter('LikeAction', post.score),
    createInteractionCounter('CommentAction', post.count_comments),
  ];

  const mentions = topPostsPages.results
    .slice(0, 5)
    .filter((v) => v?.dir && v.dir !== dir)
    .map((post) =>
      new ArticleBuilder()
        .set({
          headline: post.header,
          image: post.attachment?.mid
            ? new ImageObjectBuilder()
                .set({
                  url: UrlFormatter.media(post.attachment.mid),
                })
                .build()
            : undefined,
          author: getAuthorBuilder(
            siteConfig,
            mergeAuthorsObject(post.author_user, post.author_publisher, post.author_club)
          ).build(),
          name: post.header,
          url: postUrl,
        })
        .build()
    )
    .filter(Boolean);

  const wordCount = post.text ? post.text.replace(htmlRegExp, '').trim().split(/\s+/).length : 0;

  const schema = new DiscussionForumPostingBuilder()
    .set({
      '@id': postUrl,
      headline: post.header,
      url: postUrl,
      articleBody: (post.text ?? '').replace(htmlRegExp, '').trim(),
      datePublished: post.created_at,
      dateModified: post.created_at,
      author: getAuthorBuilder(siteConfig, postAuthor).build(),
      about: new ThingBuilder()
        .set({
          name: post.header,
          description: post.text.replace(htmlRegExp, '').trim().slice(0, 300),
        })
        .build(),
      publisher: createPublisher(siteConfig),
      image,
      interactionStatistic: interactionStats,
      comment: commentBuilders.filter(
        (comment): comment is NonNullable<typeof comment> => comment !== null
      ),
      keywords: post.tags?.map((t) => t.name),
      mentions,
      isFamilyFriendly: true,
      inLanguage: tReusable('language', { lang: siteConfig.localization.locale }),
      wordCount,
      mainEntityOfPage: createMainEntityOfPage(postUrl, post.header, siteConfig),
      potentialAction: createCommentAction(postUrl, t('potential-actions.comment')),
    })
    .build();

  return (
    <script
      id="post-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
};
