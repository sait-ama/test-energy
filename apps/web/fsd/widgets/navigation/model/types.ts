import type { CSSProperties, ReactNode } from 'react';

export interface HeaderProps {
  subheader?: ReactNode;
  className?: string;
  transparent?: boolean;
  style?: CSSProperties;
}
