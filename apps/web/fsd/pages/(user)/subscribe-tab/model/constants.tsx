import type { ComponentProps, ReactElement } from 'react';
import Image from 'next/image';

//todo ebat
export interface ProfileSubscriptionBenefitItem {
  name: string;
  description: string;
  shouldAlwaysBeInView?: boolean;
  icon: ReactElement<ComponentProps<'div'>>;
}

export interface ProfileSubscriptionAccordion {
  title: string;
  description: string;
}
export const questionsBase = [
  {
    title: 'how_to_cancel.title',
    description: 'how_to_cancel.description',
  },
  {
    title: 'feature_not_working.title',
    description: 'feature_not_working.description',
  },
] as const;

export const questions1 = [
  {
    title: 'what_gives.title',
    description: 'what_gives.description',
  },
] as const;

export const questions2 = [
  {
    title: 'paid_chapters.title',
    description: 'paid_chapters.description',
  },
] as const;
export const benefitsBase = [
  {
    name: 'bookmarks.title',
    description: 'bookmarks.description',
    icon: <Image width={164} height={164} src="/subscription/icon-bookmark.webp" alt="" />,
  },
  {
    name: 'customization.title',
    description: 'customization.description',
    icon: <Image width={164} height={164} src="/subscription/icon-customization.webp" alt="" />,
  },
  {
    name: 'no_ads.title',
    description: 'no_ads.description',
    icon: (
      <Image
        style={{ transform: 'rotate(20deg)' }}
        width={164}
        height={164}
        src="/subscription/icon-present.webp"
        alt=""
      />
    ),
  },
  {
    name: 'battlepass.title',
    description: 'battlepass.description',
    icon: <Image width={164} height={164} src="/subscription/icon-battle-pass.webp" alt="" />,
  },
  {
    name: 'cards.title',
    description: 'cards.description',
    icon: <Image width={164} height={164} src="/subscription/icon-card.webp" alt="" />,
  },
  {
    name: 'lightning_multiplier.title',
    description: 'lightning_multiplier.description',
    icon: <Image width={164} height={164} src="/subscription/activity-icon.webp" alt="" />,
  },
  {
    name: 'lightnings.title',
    description: 'lightnings.description',
    icon: <Image width={164} height={164} src="/subscription/icon-coins.webp" alt="" />,
  },
  {
    name: 'deck.title',
    description: 'deck.description',
    icon: <Image width={164} height={164} src="/subscription/icon-pack.webp" alt="" />,
  },
] as const;

export const benefitType1 = [
  {
    name: 'free_chapters.title',
    description: 'free_chapters.description',
    icon: <Image width={164} height={164} src="/subscription/icon-ticket.webp" alt="" />,
  },
] as const;

export const benefitType2 = [];
