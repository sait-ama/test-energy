import { Routing } from '~shared/config/routing';

export enum CUSTOM_TASKS {
  SUBSCRIBE_VK = 40,
}

export const CUSTOM_TASKS_CHECKS = {
  [CUSTOM_TASKS.SUBSCRIBE_VK]: 'vk',
} as const;

export const RECURSIVE_TASKS_TYPES = ['daily', 'weekly', 'monthly'] as const;

//      (46, 'Собрать пазл (внешняя мини-игра)'),
//         (47, 'Выиграть в три в ряд (внешняя мини-игра)'),
//         (48, 'Сыграть в Найди пару (внешняя мини-игра)'),
//         (49, 'Пройти квиз (внешняя мини-игра)'),
//         (49, 'Пройти 5 слов (внешняя мини-игра)'),
//         (50, 'Собери 2048 (внешняя мини-игра)'),

export const game2Link = {
  46: Routing.User.Battlepass.Games.puzzle(),
  48: Routing.User.Battlepass.Games.memory(),
  49: Routing.User.Battlepass.Games.quiz(),
  63: Routing.User.Battlepass.Games.findDifference(),
};
