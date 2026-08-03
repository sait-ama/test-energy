import type { TitleDetailSchema } from '~shared/api/models/title';
import type { ContentTypes } from '~shared/config/constants';

export const generateDescriptionTemplateText = (
  model: TitleDetailSchema,
  contentType: ContentTypes
) => {
  const {
    genres = [],
    categories = [],
    main_name = '',
    secondary_name = '',
    issue_year = 0,
    status = {},
    another_name,
    count_chapters,
  } = model;

  return `Вы находитесь на странице ${contentType === 'novel' ? 'новеллы' : 'манги'} ${main_name} / ${secondary_name} / ${another_name}. Относится к жанрам ${
    genres ? getVisibleGenres(genres, 5, false) : ''
  } и категориям ${categories ? getVisibleGenres(categories, 5, false) : ''}. Выпускается с ${issue_year} года, статус ${
    contentType === 'novel' ? 'новеллы' : 'манги'
  } - ${status?.name.toLowerCase()}. Переведено ${count_chapters + 1} глав`;
};

export const getMetaDescription = (model: TitleDetailSchema, contentType: ContentTypes) => {
  const description = model.description
    ? `Читать бесплатно ${model.type.name.toLowerCase()} ${model.count_chapters + 1} глав на русском ${model.main_name} / ${model.secondary_name} / ${
        model.another_name
      }: \n ${model.description} \n Авторы: ${Object.values(model.creators)
        .map((it) => it.name)
        .join(', ')}`
    : generateDescriptionTemplateText(model, contentType);

  return `${(description ?? '')
    .replace(/(<([^>]+)>)/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00A0/gi, ' ')}...`;
};

export const getVisibleGenres = (
  arr: TitleDetailSchema['genres'],
  endPosition: number,
  useMetaTags: boolean
) => {
  if (!Array.isArray(arr)) return null;

  if (useMetaTags) {
    return arr
      .map((item) => <meta key={item.name} itemProp="genre" content={item.name.toLowerCase()} />)
      .slice(0, endPosition);
  }
  return arr.map((item) => item.name.toLowerCase()).slice(0, endPosition);
};

export const getAgeLimitRange = (ageLimit: TitleDetailSchema['age_limit']) => {
  const ageLimits = {
    0: '0+',
    1: '16+',
    2: '18+',
  };

  return ageLimits[ageLimit] ?? '';
};
