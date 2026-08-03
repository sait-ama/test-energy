import type { BaseTitleSchema } from '~features/title-form/model/validators';
import type { FormSchema, FormsTypes } from '~shared/api/models/forms';

export const titleField2LabelMap: Record<keyof BaseTitleSchema['title'], string> = {
  main_name: 'Название',
  secondary_name: 'Дополнительное название',
  another_name: 'Другое название',
  type: 'Тип',
  wallpaper: 'Обложка',
  cover: 'Обложка',
  status: 'Статус',
  age_limit: 'Возрастное ограничение',
  issue_year: 'Год выпуска',
  translate_status: 'Статус перевода',
  categories: 'Категории',
  genres: 'Жанры',
  creators: 'Создатели',
  adaptation_id: 'ID Адаптация',
  description: 'Описание',
  forbidden_fields: 'Запрещенные поля',
  user_message: 'Сообщение пользователю',
};

export const titleFormsTypes = [
  'status',
  'categories',
  'genres',
  'types',
  'age_limit',
  'translate_status',
  'additional',
  'forbidden_fields',
  'relations',
] satisfies FormSchema<FormsTypes.TITLES>['get'];
