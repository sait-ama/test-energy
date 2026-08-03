import { ComponentType } from 'react';

import Activity from '@re/ui-kit/icons/activity';
import Card from '@re/ui-kit/icons/card';
import Gift from '@re/ui-kit/icons/gift';
import TicketBonus from '@re/ui-kit/icons/ticket-bonus';
import type { IconProps } from '@re/ui-kit/ui/icon';

export const levelsColors = [
  { name: 'Бронзовый', rgb: 'rgb(205, 127, 50)' }, // Bronze
  { name: 'Железный', rgb: 'rgb(200,199,199)' }, // Iron
  { name: 'Серебряный', rgb: 'rgb(184,253,255)' }, // Silver
  { name: 'Золотой', rgb: 'rgb(255, 215, 0)' }, // Gold
  { name: 'Сапфировый', rgb: 'rgb(15,186,49)' }, // Sapphire
  { name: 'Рубиновый', rgb: 'rgb(224, 17, 95)' }, // Ruby
  { name: 'Аметистовый', rgb: 'rgb(153, 102, 204)' }, // Amethyst
  { name: 'Жемчужный', rgb: 'rgb(233,36,255)' }, // Pearl
  { name: 'Обсидиановый', rgb: 'rgb(53, 56, 57)' }, // Obsidian
  { name: 'Бриллиантовый', rgb: 'rgb(127,232,253)' }, // Diamond
];

export const ClubBonusIcons = {
  card_chance_multiplier: Card,
  coins_chance_multiplier: Activity,
  tickets_per_week: TicketBonus,
  give_deck_once_week: Gift,
} satisfies Record<string, ComponentType<IconProps>>;
