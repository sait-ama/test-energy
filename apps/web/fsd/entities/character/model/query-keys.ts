import { queryKit } from '~shared/api/react-query';

export namespace CharacterQueryKeys {
  // export const getCharacter = (id: string) => ['character', id];
  //
  // export const getCharacterCards = (id: string) => ['characterCards', id];
  export const getCharacter = queryKit.createQueryKey((variables) => [
    'character',
    { authDepend: false, ...variables },
  ]);
  export const byTitle = queryKit.createQueryKey((variables) => [
    'title-character',
    { authDepend: false, ...variables },
  ]);
  export const getCharacterCards = queryKit.createQueryKey((variables) => [
    'characterCards',
    { authDepend: false, ...variables },
  ]);
}
