import { createSvgIcon } from '../utils/create-svg-icon';

export const MenuIcon = createSvgIcon(
  'Menu',
  <>
    <path d="M2.69922 3.59961H16.1992" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M2.69922 9H16.1992" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M2.69922 14.4004H16.1992" strokeWidth="1.75" strokeLinecap="round" />
  </>,
  {
    viewBox: '0 0 18 18',
    stroke: 'currentColor',
    fill: 'none',
  }
);

export default MenuIcon;
