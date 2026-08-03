import {
  v2TitlesCollectionsCreate,
  v2TitlesCollectionsDestroy,
  v2TitlesCollectionsList,
  v2TitlesCollectionsRetrieve,
  v2TitlesCollectionsUpdate,
} from '~shared/api/generate/repositories';

export namespace CollectionsRepository {
  export const list = v2TitlesCollectionsList;
  export const remove = v2TitlesCollectionsDestroy;
  export const retrieve = v2TitlesCollectionsRetrieve;
  export const add = v2TitlesCollectionsCreate;
  export const edit = v2TitlesCollectionsUpdate;
}
