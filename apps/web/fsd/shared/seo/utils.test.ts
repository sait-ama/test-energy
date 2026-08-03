import { describe, expect, it } from 'vitest';

import {
  AnchorLinks,
  createActionAnchor,
  createActionAriaLabel,
  createAnchorUrl,
  createCommentPotentialAction,
  createEntityAnchor,
  createImageObject,
  createInteractionCounter,
  createInteractionType,
  createListAriaLabel,
  createListItem,
  createListItemAttributes,
  createListPotentialAction,
  createPublisher,
  createSearchAriaLabel,
  createSearchPotentialAction,
} from './utils';

describe('SEO utils', () => {
  const siteConfig = { routing: { url: 'https://example.com' }, site: { name: 'Site' } };

  it('creates publisher with logo', () => {
    const publisher = createPublisher(siteConfig);
    expect(publisher).toHaveProperty('name', 'Site');
  });

  it('creates interaction type/counter', () => {
    const type = createInteractionType('LikeAction');
    expect(type['@id']).toBe('https://schema.org/LikeAction');
    const counter = createInteractionCounter('LikeAction', 5);
    expect(counter.userInteractionCount).toBe(5);
  });

  it('creates image object', () => {
    const img = createImageObject('https://img', 'cap', 'desc', true);
    expect(img.url).toBe('https://img');
    expect(img.caption).toBe('cap');
    expect(img.description).toBe('desc');
    expect(img.representativeOfPage).toBe(true);
  });

  it('anchors and aria helpers', () => {
    expect(createAnchorUrl('https://example.com', 'x')).toBe('https://example.com#x');
    expect(createEntityAnchor('comment', 1)).toBe('comment-1');
    expect(createActionAnchor('CommentAction', 2)).toBe('comment-action-2');
    expect(createActionAriaLabel('Like', 'Item')).toBe('Like Item');
    expect(createSearchAriaLabel('Name')).toBe('Search Name');
    expect(createListAriaLabel('List', 3)).toBe('List (3 items)');
  });

  it('list helpers', () => {
    const attrs = createListItemAttributes(0, 5);
    expect(attrs['aria-posinset']).toBe(1);
    const item = createListItem(1, {
      '@type': 'Thing',
      '@id': 'id',
      name: 'name',
      url: 'url',
    });
    expect(item.position).toBe(1);
  });

  it('creates potential actions', () => {
    const url = 'https://example.com/page';
    expect(createCommentPotentialAction(url, 'Name').target).toContain(AnchorLinks.CommentAction);
    expect(createSearchPotentialAction(url, 'Query').name).toContain('Search');
    expect(createListPotentialAction(url, 'List', 1).name).toContain('List');
  });
});
