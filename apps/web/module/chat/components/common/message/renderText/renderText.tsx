import React, { JSX } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
// @ts-expect-error
import type { Options } from 'react-markdown/lib';

import { find } from 'linkifyjs';
import uniqBy from 'lodash.uniqby';
import remarkGfm from 'remark-gfm';
import type { PluggableList } from 'unified'; // A subdependency of react-markdown. The type is not declared or re-exported from anywhere else

import { Anchor, Emoji, Mention } from './componentRenderers';
import { detectHttp, escapeRegExp, matchMarkdownLinks, messageCodeBlocks } from './regex';
import { emojiMarkdownPlugin, mentionsMarkdownPlugin } from './rehypePlugins';
import { htmlToTextPlugin, keepLineBreaksPlugin } from './remarkPlugins';

export type RenderTextPluginConfigurator = (defaultPlugins: PluggableList) => PluggableList;

export const defaultAllowedTagNames: Array<keyof JSX.IntrinsicElements | 'emoji' | 'mention'> = [
  'html',
  'text',
  'br',
  'p',
  'em',
  'strong',
  'a',
  'ol',
  'ul',
  'li',
  'code',
  'pre',
  'blockquote',
  'del',
  'table',
  'thead',
  'tbody',
  'th',
  'tr',
  'td',
  'tfoot',
  // custom types (tagNames)
  'emoji',
  'mention',
];

function formatUrlForDisplay(url: string) {
  try {
    return decodeURIComponent(url).replace(detectHttp, '');
  } catch {
    return url;
  }
}

function encodeDecode(url: string) {
  try {
    return encodeURI(decodeURIComponent(url));
  } catch {
    return url;
  }
}

/**
 * Purges text of potentially unwanted content
 * @param text The text to purge
 * @returns The purged text
 */
export function purgeText(text?: string): string | undefined {
  if (!text) return text;

  // Remove any script tags and their content
  let purgedText = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any iframe tags
  purgedText = purgedText.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove any on* attributes (onclick, onload, etc.)
  purgedText = purgedText.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Remove any data: URLs
  purgedText = purgedText.replace(/data:[^"')\s]+/gi, 'javascript:void(0)');

  // Remove any javascript: URLs
  purgedText = purgedText.replace(/javascript:[^"')\s]+/gi, 'javascript:void(0)');

  // Strip all HTML tags and return only the text content
  purgedText = purgedText.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  purgedText = purgedText
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return purgedText;
}

const urlTransform = (uri: string) => (uri.startsWith('app://') ? uri : defaultUrlTransform(uri));

const getPluginsForward: RenderTextPluginConfigurator = (plugins: PluggableList) => plugins;

export const markDownRenderers: Options['components'] = {
  a: Anchor,
  emoji: Emoji,
  mention: Mention,
};

export type RenderTextOptions = {
  allowedTagNames?: Array<keyof JSX.IntrinsicElements | 'emoji' | 'mention' | (string & {})>;
  getRehypePlugins?: RenderTextPluginConfigurator;
  getRemarkPlugins?: RenderTextPluginConfigurator;
  skipPurge?: boolean; // Option to skip purging
  returnPureText?: boolean; // Option to return pure text without any HTML or markdown processing
};

export const renderText = (
  text?: string,
  mentionedUsers?: any[],
  {
    allowedTagNames = defaultAllowedTagNames,
    getRehypePlugins = getPluginsForward,
    getRemarkPlugins = getPluginsForward,
    skipPurge = false,
    returnPureText = false,
  }: RenderTextOptions = {}
) => {
  // take the @ mentions and turn them into markdown?
  // translate links
  if (!text) return null;
  if (text.trim().length === 1) return <>{text}</>;

  // Purge the text if purging is not skipped
  let newText = skipPurge ? text : purgeText(text) || '';

  // If returnPureText is true, return the purged text directly without any processing
  if (returnPureText) {
    return <>{newText}</>;
  }

  const markdownLinks = matchMarkdownLinks(newText);
  const codeBlocks = messageCodeBlocks(newText);

  // extract all valid links/emails within text and replace it with proper markup
  uniqBy([...find(newText, 'email'), ...find(newText, 'url')], 'value').forEach(
    ({ href, type, value }) => {
      const linkIsInBlock = codeBlocks.some((block) => block?.includes(value));

      // check if message is already  markdown
      const noParsingNeeded =
        markdownLinks &&
        markdownLinks.filter((text) => {
          const strippedHref = href?.replace(detectHttp, '');
          const strippedText = text?.replace(detectHttp, '');

          if (!strippedHref || !strippedText) return false;

          return strippedHref.includes(strippedText) || strippedText.includes(strippedHref);
        });

      if (noParsingNeeded.length > 0 || linkIsInBlock) return;

      try {
        // special case for mentions:
        // it could happen that a user's name matches with an e-mail format pattern.
        // in that case, we check whether the found e-mail is actually a mention
        // by naively checking for an existence of @ sign in front of it.
        if (type === 'email' && mentionedUsers) {
          const emailMatchesWithName = mentionedUsers.some((u) => u.name === value);
          if (emailMatchesWithName) {
            newText = newText.replace(new RegExp(escapeRegExp(value), 'g'), (match, position) => {
              const isMention = newText.charAt(position - 1) === '@';
              // in case of mention, we leave the match in its original form,
              // and we let `mentionsMarkdownPlugin` to do its job
              return isMention ? match : `[${match}](${encodeDecode(href)})`;
            });

            return;
          }
        }

        const displayLink = type === 'email' ? value : formatUrlForDisplay(href);

        newText = newText.replace(
          new RegExp(escapeRegExp(value), 'g'),
          `[${displayLink}](${encodeDecode(href)})`
        );
      } catch (e) {
        void e;
      }
    }
  );

  const remarkPlugins: PluggableList = [
    htmlToTextPlugin,
    keepLineBreaksPlugin,
    [remarkGfm, { singleTilde: false }],
  ];
  const rehypePlugins: PluggableList = [emojiMarkdownPlugin];

  if (mentionedUsers?.length) {
    rehypePlugins.push(mentionsMarkdownPlugin(mentionedUsers));
  }

  return (
    <ErrorBoundary fallback={<>{text}</>}>
      <ReactMarkdown
        allowedElements={allowedTagNames}
        components={markDownRenderers}
        rehypePlugins={getRehypePlugins(rehypePlugins)}
        remarkPlugins={getRemarkPlugins(remarkPlugins)}
        skipHtml
        unwrapDisallowed
        urlTransform={urlTransform}
      >
        {newText}
      </ReactMarkdown>
    </ErrorBoundary>
  );
};
