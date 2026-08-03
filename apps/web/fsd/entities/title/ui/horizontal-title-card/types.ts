import { CSSProperties, ReactNode } from 'react';

import { TitleSchemaFragment } from '~shared/api/models/title';

export type HorizontalTitleCard = TitleSchemaFragment;

export interface HorizontalCardProps<T extends HorizontalTitleCard> {
  model: T | null;
  getHref?: (contentType: string, title: T) => string;
  tag?: ReactNode;
  isLoading?: boolean;
  className?: string;
  rating?: ReactNode;
  style?: CSSProperties;
  baseDomain?: string;
  actions?: ReactNode;
  subtitle?: ReactNode;
  size?: 'xs' | 'sm' | 'md';
  onClick: () => void;
  [key: `data-${string}`]: NumberIsomorphic | boolean;
}
