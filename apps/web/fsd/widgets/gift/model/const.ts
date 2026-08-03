import type { HeroCardSchema } from '~shared/api/models/inventory';

export const REGISTER_GIFT = {
  id: 4544,
  cover: {
    high: '/media/card-item/cover_e9ddf6be.webp',
    mid: '/media/card-item/cover_4567f05e.webp',
  },
  description: '<p class="editor-paragraph"><br></p>',
  rank: 'rank_d',
  author: {
    id: 35820,
    username: 'МЫСЛИТЕЛЬ_10000_ТАЙН',
    tagline: 'Любитель чтения',
    is_premium: false,
    frame: {},
    avatar: {
      mid: '/media/users/35820/avatar_718cc13f.webp',
      high: '/media/users/35820/avatar_e02e9d4c.webp',
    },
  },
  title: {
    id: 168,
    main_name: 'Сказания о демонах и богах',
    secondary_name: 'Tales of Demons and Gods',
    type: {
      id: 3,
      name: 'Маньхуа',
    },
    status: {
      id: 6,
      name: 'Лицензировано',
    },
    translate_status: {
      id: 2,
      name: 'Продолжается',
    },
    dir: 'tales_of_demons_and_gods',
    issue_year: 2015,
    avg_rating: '9.0',
    total_votes: 3424591,
    total_views: 23073290,
    count_bookmarks: 102208,
    count_moments: 0,
    is_licensed: true,
    another_name:
      'Yao Shen Ji / 妖神记 / Клеймо Зловещего Духа / Yeu Than Ky / 妖神记（全彩） / Сказание о Демонах и Богах / Pasakojimas apie Demonus ir Dievus / Cuentos de Demonios y Dioses / Yêu Thần Ký / TDG / Yāo Shén Jì / 요신기 / As Lendas de Yonah / Fortellinger om Demoner og Gude / Fortellinger om Demoner og Guder',
    is_legal: false,
    cover: {
      low: '/media/titles/tales_of_demons_and_gods/cover_44d6f907.webp',
      mid: '/media/titles/tales_of_demons_and_gods/cover_1e43b590.webp',
      high: '/media/titles/tales_of_demons_and_gods/cover_b24cdf05.webp',
    },
    count_chapters: 492,
    is_yaoi: false,
    is_erotic: false,
    bookmark_type: null,
    is_forbidden: false,
  },
  character: {
    id: 10073,
    name: 'Не Ли',
    alt_name: '',
    cover: {
      mid: 'title-character/cover_2d93e4ac.webp',
      high: 'title-character/cover_8045a243.webp',
    },
    description:
      '<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">Сильнейший в малом мире заклинатель </span></p>',
    details: {
      power: '',
      sex: '',
      classification: '',
      affiliation: '',
      age: '',
      skills: '',
    },
  },
  is_favorite: false,
} as unknown as HeroCardSchema;
