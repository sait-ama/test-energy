import {
  CommentActionBuilder,
  ImageObjectBuilder,
  InteractionCounterBuilder,
  OrganizationBuilder,
} from './schema-org';

export enum AnchorLinks {
  CommentAction = 'comment-action',
  CommentForm = 'comment-form',
  Comment = 'comment',
  LikeAction = 'like-action',
  ShareAction = 'share-action',
}

export const createLogo = (siteConfig: { routing: { url: string } }) =>
  new ImageObjectBuilder()
    .set({
      url: `${siteConfig.routing.url}/icons/android-chrome-192x192.png`,
    })
    .build();

export const createPublisher = (siteConfig: { routing: { url: string }; site: { name: string } }) =>
  new OrganizationBuilder()
    .set({
      url: siteConfig.routing.url,
      name: siteConfig.site.name,
      logo: createLogo(siteConfig),
    })
    .build();

type InteractionType = 'LikeAction' | 'CommentAction' | 'WriteAction';

export const createInteractionType = (type: InteractionType) => ({
  '@type': type,
  '@id': `https://schema.org/${type}`,
});

export const createInteractionCounter = (type: InteractionType, count: number) =>
  new InteractionCounterBuilder()
    .set({
      interactionType: createInteractionType(type),
      userInteractionCount: count,
    })
    .build();

export const createImageObject = (
  url: string,
  caption?: string,
  description?: string,
  representiveOfPage?: boolean
) =>
  new ImageObjectBuilder()
    .set({
      url,
      ...(caption && { caption }),
      ...(description && { description }),
      representativeOfPage: representiveOfPage ?? true,
    })
    .build();

export const createMainEntityOfPage = (
  url: string,
  name: string,
  siteConfig: { routing: { url: string }; site: { name: string } }
) => ({
  '@type': 'WebPage',
  '@id': url,
  name,
  isPartOf: {
    '@type': 'WebSite',
    name: siteConfig.site.name,
    url: siteConfig.routing.url,
  },
});
export const createAnchorUrl = (baseUrl: string, anchor: string) => `${baseUrl}#${anchor}`;

export const createCommentAction = (url: string, name: string) =>
  new CommentActionBuilder()
    .set({
      name,
      target: createAnchorUrl(url, AnchorLinks.CommentAction),
    })
    .build();

export type PotentialActionType = keyof typeof AnchorLinks;

export const createEntityAnchor = (entityType: string, id: string | number) =>
  `${entityType}-${id}`;

export const createActionAnchor = (action: PotentialActionType, id?: string | number) => {
  const kebabAction = action
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  return id ? `${kebabAction}-${id}` : AnchorLinks[action];
};

export const createActionAriaLabel = (action: string, entityName?: string) =>
  entityName ? `${action} ${entityName}` : action;

export const createSearchAriaLabel = (placeholder: string) => `Search ${placeholder}`;

export const createListAriaLabel = (listName: string, count?: number) =>
  count ? `${listName} (${count} items)` : listName;

export const createCommentPotentialAction = (url: string, name: string, id?: string | number) => ({
  '@type': 'CommentAction',
  name: createActionAriaLabel('Comment', name),
  target: createAnchorUrl(url, createActionAnchor('CommentAction', id)),
});

export const createLikePotentialAction = (url: string, name: string, id?: string | number) => ({
  '@type': 'LikeAction',
  name: createActionAriaLabel('Like', name),
  target: createAnchorUrl(url, createActionAnchor('LikeAction', id)),
});

export const createSharePotentialAction = (url: string, name: string) => ({
  '@type': 'ShareAction',
  name: createActionAriaLabel('Share', name),
  target: createAnchorUrl(url, AnchorLinks.ShareAction),
});

export const createSearchPotentialAction = (url: string, placeholder: string) => ({
  '@type': 'SearchAction',
  name: createSearchAriaLabel(placeholder),
  target: createAnchorUrl(url, 'search'),
});

export const createListPotentialAction = (url: string, listName: string, count?: number) => ({
  '@type': 'ViewAction',
  name: createListAriaLabel(listName, count),
  target: createAnchorUrl(url, 'list'),
});

export const createSearchAttributes = (placeholder: string) => ({
  'aria-label': createSearchAriaLabel(placeholder),
  'aria-placeholder': placeholder,
  role: 'searchbox',
  type: 'search',
});

export const createActionButtonAttributes = (
  action: PotentialActionType,
  entityName?: string,
  id?: string | number
) => ({
  'aria-label': createActionAriaLabel(action, entityName),
  'data-action': createActionAnchor(action, id),
  role: 'button',
});

export const createListAttributes = (listName: string, count?: number) => ({
  'aria-label': createListAriaLabel(listName, count),
  role: 'list',
  'aria-setsize': count,
});

export const createListItemAttributes = (index: number, total: number) => ({
  role: 'listitem',
  'aria-posinset': index + 1,
  'aria-setsize': total,
});

export const createListItem = (
  position: number,
  item: { '@type': string; '@id': string; name: string; description?: string; url: string }
) => ({
  '@type': 'ListItem',
  position,
  item,
});
