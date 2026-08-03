import { PostEntity } from '@re/api/generated/types.gen';

import { POST_ATTACHMENT_TYPE, POST_ATTACHMENT_TYPE_MUTI } from './const';

export const transformAttachmentName = (name: string) => {
  let resolvedName = '';

  Object.entries(POST_ATTACHMENT_TYPE_MUTI).forEach(([key, value]) => {
    if (name !== value) return;

    resolvedName = POST_ATTACHMENT_TYPE[key];
  });

  return resolvedName;
};

export type TransformedAttachmentsSchema = Record<
  (typeof POST_ATTACHMENT_TYPE)[keyof typeof POST_ATTACHMENT_TYPE],
  // PostEntity['attachments'][keyof PostEntity['attachments']]
  any
>;

export const transformPostAttachments = (
  attachments: PostEntity['attachments']
): TransformedAttachmentsSchema => {
  if (!attachments) return {};

  const resolvedAttachments: TransformedAttachmentsSchema = {};

  Object.entries(attachments).map(([key, value]) => {
    const newKey = transformAttachmentName(key);
    resolvedAttachments[newKey] = value;
  });

  return resolvedAttachments;
};
