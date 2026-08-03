import { CollectionSchema } from '~shared/api/models/collectionSchema';
import { UrlFormatter } from '~shared/utils/url-formatter';
//  todo invalid response from collection api - instead img.cover.high - base64 string
export const safeResolveCollectionCover = (
  cover: CollectionSchema['cover'] | string | undefined
) => {
  const coverIsValid = typeof cover !== 'string';
  if (!cover) return cover;
  const url = coverIsValid ? cover?.high : cover;
  return UrlFormatter.media(url);
};
