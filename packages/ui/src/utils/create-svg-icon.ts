import type { FC, ReactNode, RefAttributes } from 'react';
import { createElement } from 'react';

import type { IconProps } from '../ui/icon';
import { Icon } from '../ui/icon';

import { cn } from './cn';

/**
 * Create a icon component
 * @param {string} iconName
 * @param {ReactNode} children
 * @param {IconProps} defaultProps
 * @returns {ForwardRefExoticComponent} ReIconProps
 */
export type SVGIcon = Omit<IconProps, 'ref'> & RefAttributes<SVGSVGElement>;

export const createSvgIcon = (iconName: string, children: ReactNode, defaultProps?: IconProps) => {
  const Component: FC<IconProps> = (props) =>
    createElement(
      Icon,
      {
        ...defaultProps,
        ...props,
        className: cn(defaultProps?.className, props.className),
      },
      children
    );

  Component.displayName = iconName;

  return Component;
};
