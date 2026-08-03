import { z } from 'zod';

export enum MaxMessageLenByRole {
  USER = 600,
  STAFF = 3000,
}

// TODO: вынести или принимать editorState
export const stickersLen = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.querySelectorAll('img.sticker').length;
};
export const createActivityFormValidator = ({
  maxLength = MaxMessageLenByRole.USER,
}: {
  maxLength?: MaxMessageLenByRole;
}) => {
  return z.object({
    text: z.string().superRefine((text: string, ctx) => {
      // if (hasStickers(text)) return true;
      const val = text.replace(/(<([^>]+)>)/gi, '');
      const finalLen = stickersLen(text) * 5 + val.length;
      if (finalLen < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 3,
          type: 'string',
          inclusive: true,
          message: 'Cлишком мелкий комментарий 😡',
        });
      }

      if (finalLen > maxLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: maxLength,
          type: 'string',
          inclusive: true,
          message: 'Cлишком большой комментарий 😡',
        });
      }
    }),
    // .transform((text) => {
    //     return text.replaceAll(/(<img\s+[^>]*?src=")([^"]*)(")/g, (_, p1, p2, p3) => {
    //         return `${p1}${UrlFormatter.fromMedia(p2)}${p3}`;
    //     });
    // }),
    is_spoiler: z.boolean().optional(),
    is_pinned: z.boolean().optional(),
  });
};
export const ActivityFormValidator = createActivityFormValidator({
  maxLength: MaxMessageLenByRole.USER,
});
export type ActivityInputSchema = z.infer<typeof ActivityFormValidator>;
