import { Preference } from '~shared/api/models/user';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface PreferenceCardSource {
  width: number;
  height: number;
  src: string;
  title: string;
  description: string;
  preference: Preference;
}

export const preferences: PreferenceCardSource[] = [
  {
    width: 150,
    height: 200,
    src: UrlFormatter.media('public/preference/rem.webp'),
    title: 'Все',
    description: 'Потные культиваторы, реинкарнаторы, гЭймеры и школьная любовь',
    preference: Preference.ALL,
  },
  {
    width: 218,
    height: 200,
    src: UrlFormatter.media('public/preference/eren.webp'),
    title: 'Адам',
    description: 'Потные культиваторы, реинкарнаторы и гЭймеры',
    preference: Preference.ADAM,
  },
  {
    width: 135,
    height: 200,
    src: UrlFormatter.media('public/preference/eromanga.webp'),
    title: 'Ева',
    description: 'Школьная любовь, повседневность и злодейки-попаданки',
    preference: Preference.EVA,
  },
];
