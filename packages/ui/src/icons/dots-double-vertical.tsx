import { createSvgIcon } from '../utils/create-svg-icon';

export const DotsDoubleVerticalIcon = createSvgIcon(
  'DotsDoubleVertical',
  <>
    <rect y="5" width="3" height="3" rx="1.5" fill="currentColor" fillOpacity="0.6" />
    <rect y="12" width="3" height="3" rx="1.5" fill="currentColor" fillOpacity="0.6" />
  </>,
  {
    viewBox: '0 0 3 20',
    fill: 'none',
  }
);

export default DotsDoubleVerticalIcon;
