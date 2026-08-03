import { z } from 'zod';

import { AttachmentEntity } from '@re/api/generated/types.gen';

import { serializeFormValues } from '~widgets/post/(forum)/forum-post-changing-form/model/utils';

export type PostFormSchema = {
  header: string;
  text: string;
  tags: (string | number)[];
  author: {
    id: string;
    type: string;
  };
  relation: {
    type: string;
    id: string;
  };
  attachment: string;
  attachments: AttachmentEntity;
};
export const zClientForumSchema = z.any().transform(serializeFormValues);
