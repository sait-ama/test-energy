import { Features } from '~shared/config/feature-flags';

export enum TitleDetailPageTabs {
  MAIN = 'main',
  CHAPTERS = 'chapters',
  POSTS = 'posts',
  CARDS = 'cards',
  CHARACTERS = 'characters',
  ANIME = 'anime',
  MOMENTS = 'moments',
  VOICEOVER = 'voiceover',
  COMMENTS = 'comments',
}

export const TitleDetailPageTabsList = [
  { value: TitleDetailPageTabs.MAIN, name: 'Главная' },
  { value: TitleDetailPageTabs.CHAPTERS, name: 'Главы', count_field: 'count_chapters' },
  { value: TitleDetailPageTabs.COMMENTS, name: 'Комментарии', count_field: 'count_comments' },
  {
    value: TitleDetailPageTabs.POSTS,
    name: 'Обсуждения',
    count_field: 'count_posts',
    feature: Features.FORUM,
  },
  { value: TitleDetailPageTabs.MOMENTS, name: 'Моменты', count_field: 'count_moments' },
  { value: TitleDetailPageTabs.CARDS, name: 'Карты', count_field: 'count_cards' },
  { value: TitleDetailPageTabs.CHARACTERS, name: 'Персонажи', count_field: 'count_characters' },
  { value: TitleDetailPageTabs.ANIME, name: 'Аниме', count_field: 'count_anime' },
  { value: TitleDetailPageTabs.VOICEOVER, name: 'Озвучка' },
];
