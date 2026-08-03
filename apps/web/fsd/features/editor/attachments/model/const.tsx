import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';

export const MENTION_VARIANTS = [
  {
    type: POST_ATTACHMENT_TYPE.user,
    tName: POST_ATTACHMENT_TYPE.user,
  },
  {
    type: POST_ATTACHMENT_TYPE.club,
    tName: POST_ATTACHMENT_TYPE.club,
  },
  {
    type: POST_ATTACHMENT_TYPE.publisher,
    tName: POST_ATTACHMENT_TYPE.publisher,
  },
] as const;

export type MentionType = (typeof MENTION_VARIANTS)[number]['type'];
