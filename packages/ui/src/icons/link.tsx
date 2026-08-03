import { createSvgIcon } from '../utils/create-svg-icon';

export const LinkIcon = createSvgIcon(
  'Link',
  <>
    <path
      d="M14.4922 16.5834H15.7505C18.2672 16.5834 20.3339 14.5251 20.3339 12.0001C20.3339 9.48341 18.2755 7.41675 15.7505 7.41675H14.4922"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="transparent"
    />
    <path
      d="M9.5013 7.41675H8.2513C5.7263 7.41675 3.66797 9.47508 3.66797 12.0001C3.66797 14.5167 5.7263 16.5834 8.2513 16.5834H9.5013"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="transparent"
    />
    <path d="M8.66797 12H15.3346" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  {
    stroke: 'currentColor',
    width: 20,
    height: 20,
  }
);

export default LinkIcon;
