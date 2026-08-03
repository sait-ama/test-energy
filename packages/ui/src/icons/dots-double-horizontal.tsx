import { createSvgIcon } from '../utils/create-svg-icon';

export const DotsDoubleHorizontalIcon = createSvgIcon(
  'DotsDoubleHorizontal',
  <>
    <rect
      x="5"
      y="3"
      width="3"
      height="3"
      rx="1.5"
      transform="rotate(-90 5 3)"
      fill="currentColor"
      fillOpacity="0.6"
    />
    <rect
      x="12"
      y="3"
      width="3"
      height="3"
      rx="1.5"
      transform="rotate(-90 12 3)"
      fill="currentColor"
      fillOpacity="0.6"
    />
  </>,
  {
    viewBox: '0 0 20 3',
    fill: 'none',
  }
);

export default DotsDoubleHorizontalIcon;
