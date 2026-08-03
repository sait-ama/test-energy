import {
  AttachmentCreateRequestTypeEnum,
  PostCreateRequest,
  PostEntity,
} from '@re/api/generated/types.gen';

import { transformPostTextSanitizeConfig } from '~entities/post/model/utils';
import { logger } from '~shared/lib/logger';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { parseEntityBlock } from '~shared/ui/text-editor/nodes/entity-block-node';
import { parseEntityMention } from '~shared/ui/text-editor/nodes/entity-mention-node';
import { objectOptional } from '~shared/utils/object-optional';
import { parseJson } from '~shared/utils/parse-json';
import { deduplicate } from '~shared/utils/record-deduplicator';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { PostFormSchema } from './schema';

export const pickPostAuthor = ({
  author_club,
  author_publisher,
  author_user,
}: Partial<PostEntity>) => {
  if (author_club) {
    return {
      type: 'club',
      id: author_club.id,
    };
  }

  if (author_publisher) {
    return {
      type: 'publisher',
      id: author_publisher.id,
    };
  }

  if (author_user) {
    return {
      type: 'user',
      id: author_user.id,
    };
  }

  return null;
};

export const pickPostRelation = ({ title, chapter, publisher }: Partial<PostEntity>) => {
  if (title) {
    return {
      type: 'title',
      id: title.id,
      model: title,
    };
  }

  if (chapter) {
    return {
      type: 'chapter',
      id: chapter.id,
      model: chapter,
    };
  }

  if (publisher) {
    return {
      type: 'publisher',
      id: publisher.id,
      model: publisher,
    };
  }

  return null;
};

export const serializeUsedAttachments = (text: string) => {
  try {
    const parser = new DOMParser();

    const doc = parser.parseFromString(text, 'text/html');

    const nodes = [...doc.querySelectorAll('renode[nodetype="json"]')];

    const result = nodes.map((it) => {
      const json = parseJson(it.innerHTML);

      const data = parseEntityMention(json) ?? parseEntityBlock(json) ?? null;

      if (!data) return null;

      const { entity, id } = data;

      return { type: entity as AttachmentCreateRequestTypeEnum, target_id: id };
    });

    return deduplicate(
      result.filter((it) => !!it),
      (it) => `${it.type}:${it.target_id}`
    ).map((it) => ({ ...it, target_id: String(it.target_id) }));
  } catch (e) {
    logger.error(e, { scope: ['local'] });
    return [];
  }
};

export const serializeFormValues = (values: PostFormSchema): Partial<PostCreateRequest> => {
  const { text, header, tags, author, relation, attachment } = values;

  return {
    header: sanitizeSync(header) ?? '',
    text: sanitizeSync(text, transformPostTextSanitizeConfig),
    tags: tags.map(Number),
    attachments: serializeUsedAttachments(text),
    ...objectOptional(attachment?.startsWith('data'), { attachment }),
    ...objectOptional(author?.type === 'user', { author_user_id: Number(author?.id) }),
    ...objectOptional(author?.type === 'publisher', { author_publisher_id: Number(author?.id) }),
    ...objectOptional(author?.type === 'club', { author_club_id: Number(author?.id) }),
    ...objectOptional(relation?.type === 'title', { title: Number(relation?.id) }),
    ...objectOptional(relation?.type === 'chapter', { chapter: Number(relation?.id) }),
    ...objectOptional(relation?.type === 'publisher', { publisher: Number(relation?.id) }),
  };
};

export const deserializeFormValues = (values: PostEntity): PostFormSchema => {
  const { text, header, tags, attachment } = values;

  const author = pickPostAuthor(values);
  const relation = pickPostRelation(values);

  return {
    header: sanitizeSync(header),
    text: sanitizeSync(text, transformPostTextSanitizeConfig),
    tags: tags.map((it) => String(it.id)),
    ...objectOptional(!!author, { author }),
    ...objectOptional(!!relation, { relation }),
    attachment: UrlFormatter.media(attachment?.high ?? attachment?.mid ?? null),
    attachments: {},
  };
};
