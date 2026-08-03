import { createSvgIcon } from '../utils/create-svg-icon';

export const HeartIcon = createSvgIcon(
  'heart',
  <path
    d="M9 14.6666C6.825 13.9333 1.5 10.7083 1.5 5.49998C1.5 3.19998 3.36667 1.33331 5.66667 1.33331C7.03333 1.33331 8.24167 1.99165 9 2.99998C9.75833 1.98331 10.975 1.33331 12.3333 1.33331C14.6333 1.33331 16.5 3.19165 16.5 5.49998C16.5 10.7166 11.175 13.9333 9 14.6666Z"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  {
    viewBox: '0 0 18 16',
    stroke: 'currentColor',
    height: 16,
    width: 18,
  }
);

export default HeartIcon;
