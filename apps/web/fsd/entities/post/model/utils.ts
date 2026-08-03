import { ClubMinimal, InnerPostPublisher, MinimalUser } from '@re/api/generated/types.gen';

import { SiteConfig } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { TransformSanitizeConfig } from '~shared/lib/sanitize/sanitize-sync';
import { ImageObjectBuilder, OrganizationBuilder, PersonBuilder } from '~shared/seo/schema-org';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const transformPostTextSanitizeConfig: TransformSanitizeConfig = (config) => ({
  ...config,
  FORBID_TAGS: config?.FORBID_TAGS?.filter((v) => v !== 'a'),
  ALLOWED_TAGS: [...(config?.ALLOWED_TAGS || []), 'a'],
  ADD_ATTR: [...(config?.ADD_ATTR || []), 'href', 'target'],
});

interface Author {
  id: number;
  name: string;
  frame?: Record<'high', string> | undefined;
  img: Record<'high' | 'mid', string>;
  profileHref: string;
  type: 'publisher' | 'user' | 'club';
}

export const getAuthorBuilder = (
  siteConfig: SiteConfig,
  author: ReturnType<typeof mergeAuthorsObject>
) =>
  author.type !== 'user'
    ? new OrganizationBuilder().set({
        name: author.name,
        url: `${siteConfig.routing.url}${author.profileHref}`,
        description: author.type === 'club' ? 'Гильдия' : 'Паблишер',
        ...(author?.img?.high && {
          image: new ImageObjectBuilder().set({ url: UrlFormatter.media(author.img.high) }).build(),
        }),
      })
    : new PersonBuilder().set({
        name: author.name,
        url: `${siteConfig.routing.url}${author.profileHref}`,
        ...(author?.img?.high && {
          image: new ImageObjectBuilder().set({ url: UrlFormatter.media(author.img.high) }).build(),
        }),
      });
export const mergeAuthorsObject = (
  userAuthor: MinimalUser | null | undefined,
  publisherAuthor: InnerPostPublisher | null | undefined,
  clubAuthor: ClubMinimal | null | undefined
): Author => {
  const { id, username, avatar, cover, dir, name, frame } = (clubAuthor ??
    publisherAuthor ??
    userAuthor ??
    {}) as MinimalUser & InnerPostPublisher & ClubMinimal;

  const isPublisher = !!publisherAuthor;
  const isClub = !!clubAuthor;

  return {
    id,
    frame,
    name: username ?? name,
    img: avatar ?? cover,
    profileHref: isClub
      ? Routing.Club.clubByDir({ params: { dir, tab: 'about' } })
      : isPublisher
        ? Routing.Publisher.detail({ params: { dir } })
        : Routing.User.detail({
            params: {
              id: id,
              tab: 'about',
            },
          }),
    type: isClub ? 'club' : isPublisher ? 'publisher' : 'user',
  } satisfies Author;
};
