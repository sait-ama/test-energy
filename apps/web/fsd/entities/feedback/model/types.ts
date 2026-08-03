import type { ComponentType } from 'react';

import Console from '@re/ui-kit/icons/console';
import FingerDown from '@re/ui-kit/icons/finger-down';
import FingerUp from '@re/ui-kit/icons/finger-up';
import Magic from '@re/ui-kit/icons/magic';
import { IconProps } from '@re/ui-kit/ui/icon';

import { FeedBackType } from '~shared/api/models/feedback';

export const TYPE_NAME: Record<FeedBackType, string> = {
  [FeedBackType.GoodFeedback]: 'Мне нравится',
  [FeedBackType.BadFeedback]: 'Мне не нравится',
  [FeedBackType.Bugs]: 'Нашел баг',
  [FeedBackType.Ideas]: 'Есть идея',
  [FeedBackType.EndSubscription]: 'Подписка окончена',
};

export const TYPE_ICON: Record<FeedBackType, null | ComponentType<IconProps>> = {
  // todo
  [FeedBackType.GoodFeedback]: FingerUp,
  [FeedBackType.BadFeedback]: FingerDown,
  [FeedBackType.Bugs]: Console,
  [FeedBackType.Ideas]: Magic,
  [FeedBackType.EndSubscription]: null,
};

export const TYPE_HEADING: Record<FeedBackType, string> = {
  [FeedBackType.GoodFeedback]: 'Что вам больше всего нравится?',
  [FeedBackType.BadFeedback]: 'Что вам не нравится?',
  [FeedBackType.Bugs]: 'Как вкратце можно описать баг?',
  [FeedBackType.Ideas]: 'Как вкратце можно описать идею?',
  [FeedBackType.EndSubscription]: 'Почему вы решили не продлевать подписку?',
};

export const TYPE_DESCRIPTION: Record<FeedBackType, string> = {
  [FeedBackType.Ideas]:
    'Опишите, что должна делать функция, как ее получить, какие у нее должны быть особенности',
  [FeedBackType.Bugs]:
    'Опишите, как повторить баг. Если есть дополнительные условия (страница сайта, серия действий и т. д.), обязательно укажите.',
  [FeedBackType.GoodFeedback]:
    'Расскажите, почему вам это нравится или как мы можем сделать сайт еще лучше!',
  [FeedBackType.BadFeedback]: 'Расскажите, что вам не нравится и почему',
  [FeedBackType.EndSubscription]: 'Расскажите, что вам не понравилось',
};

export const LIST_ID = {
  [FeedBackType.GoodFeedback]: '901201192975',
  [FeedBackType.BadFeedback]: '901201192976',
  [FeedBackType.Bugs]: '900401333888',
  [FeedBackType.Ideas]: '900401396467',
  [FeedBackType.EndSubscription]: '901201698237',
};

export const FIRST_STATUS_NAME = {
  [FeedBackType.GoodFeedback]: 'Не просмотрено',
  [FeedBackType.BadFeedback]: 'Не просмотрено',
  [FeedBackType.Bugs]: 'Открытый баг',
  [FeedBackType.Ideas]: 'Предложено',
  [FeedBackType.EndSubscription]: 'Открытый таск',
};
