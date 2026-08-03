import { MENTION_VARIANTS } from './const';

export const getMentionType = (typeString?: string | null) => {
  if (typeString === '')
    return {
      type: 'indefinite',
      id: null,
    } as const;

  if (!typeString) return null;

  for (const it of MENTION_VARIANTS) {
    if (it.type.startsWith(typeString)) {
      return {
        type: it.type,
        id: null,
      };
    }
    if (typeString.startsWith(`${it.type}_`)) {
      const id = typeString.split('_')[1];

      return {
        type: it.type,
        id: id || null,
      };
    }
  }

  return null;
};
