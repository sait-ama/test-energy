import { createSvgIcon } from '../utils/create-svg-icon';

export const ExternalLinkIcon = createSvgIcon(
  'ExternalLink',
  <>
    <path
      d="M7 4.1333L14.1536 4.1333L14.1536 11.2869"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.13672 14.1504L14.0539 4.23322"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,

  { viewBox: '0 0 18 18', stroke: 'currentColor', fill: 'none' }
);

export default ExternalLinkIcon;
