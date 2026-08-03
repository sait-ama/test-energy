import { FC, memo, RefAttributes, SVGProps } from 'react';
import { createElement } from 'react';

export type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ElementAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;

export interface IconProps extends ElementAttributes {
  size?: number | string;
  absoluteStrokeWidth?: boolean;
  className?: string;
  viewBox?: string;
}

const defaultAttributes = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  display: 'inline-block',
  viewBox: '0 0 24 24',
};

/**
 *
 * @component Icon
 * @param {object} props
 * @param {string} props.color - The color of the icon
 * @param {number} props.size - The size of the icon
 * @param {number} props.strokeWidth - The stroke width of the icon
 * @param {boolean} props.absoluteStrokeWidth - Whether to use absolute stroke width
 * @param {string} props.className - The class name of the icon
 * @param {ReactNode} props.children - The children of the icon
 *
 * @returns {ForwardRefExoticComponent} ReIconProps
 */
export const Icon: FC<IconProps> = memo(
  ({ size = 20, strokeWidth = 1.5, absoluteStrokeWidth, children, ...rest }) =>
    createElement(
      'svg',
      {
        ...defaultAttributes,
        width: size,
        height: size,
        strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth,
        ...rest,
      },
      children
    )
);
