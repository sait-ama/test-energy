import type { ComponentType } from 'react';

import Discord from '@re/ui-kit/icons/discord';
import Facebook from '@re/ui-kit/icons/facebook';
import Instagram from '@re/ui-kit/icons/instagram';
import Twitter from '@re/ui-kit/icons/twitter';
import Vk from '@re/ui-kit/icons/vk';
import Youtube from '@re/ui-kit/icons/youtube';
import type { IconProps } from '@re/ui-kit/ui/icon';

import type { PublisherLinkType } from '~shared/api/models/publisher';

export const socialIcons: Record<PublisherLinkType, ComponentType<IconProps>> = {
  vk: Vk,
  fb: Facebook,
  youtube: Youtube,
  twitter: Twitter,
  insta: Instagram,
  discord: Discord,
};

export const socialNames: Record<PublisherLinkType, string> = {
  vk: 'Вконтакте',
  fb: 'Facebook',
  youtube: 'Youtube',
  twitter: 'Twitter',
  insta: 'Instagram',
  discord: 'Discord',
};

export const isBanned = (name: PublisherLinkType) =>
  name === 'fb' || name === 'twitter' || name === 'insta';
