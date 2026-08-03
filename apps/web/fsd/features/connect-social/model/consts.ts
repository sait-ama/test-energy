import type { ComponentType } from 'react';

import Google from '@re/ui-kit/icons/google';
import Telegram from '@re/ui-kit/icons/telegram';
import Vk from '@re/ui-kit/icons/vk';
import Yandex from '@re/ui-kit/icons/yandex';
import type { IconProps } from '@re/ui-kit/ui/icon';

import type { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { SocialProviders } from '~shared/api/models/user';

export interface Social {
  name: string;
  provider: SocialProviders;
  field: keyof DetailedCurrentUserSchema;
  icon: ComponentType<IconProps>;
}

export const providers: Social[] = [
  {
    provider: SocialProviders.VK_CONNECT,
    name: 'ВКонтакте',
    field: 'vk_id',
    icon: Vk,
  },
  {
    provider: SocialProviders.YANDEX,
    name: 'Яндекс',
    field: 'yandex_id',
    icon: Yandex,
  },
  {
    provider: SocialProviders.GOOGLE,
    name: 'Google',
    field: 'google_id',
    icon: Google,
  },
  {
    provider: SocialProviders.TELEGRAM,
    name: 'Telegram',
    field: 'tg_id',
    icon: Telegram,
  },
  // {
  //     provider: SocialProviders.DISCORD,
  //     name: 'Discord',
  //     field: 'discord_id',
  //     icon: Discord,
  // },
];
