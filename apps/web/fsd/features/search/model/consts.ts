import { SearchField } from '~shared/api/models/search';

export interface SearchTab {
  value: SearchField;
  name: string;
  disabled?: boolean;
}

export const tabs: Record<SearchField, SearchTab> = {
  [SearchField.titles]: { value: SearchField.titles, name: 'Тайтлы' },
  [SearchField.publishers]: {
    value: SearchField.publishers,
    name: 'Команды',
  },
  [SearchField.creators]: {
    value: SearchField.creators,
    name: 'Создатели',
  },
  [SearchField.characters]: {
    value: SearchField.characters,
    name: 'Персонажи',
  },
  [SearchField.users]: {
    value: SearchField.users,
    name: 'Пользователи',
  },
  [SearchField.cards]: {
    value: SearchField.cards,
    name: 'Карточки',
    disabled: true,
  },
};
