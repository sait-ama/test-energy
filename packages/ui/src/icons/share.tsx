import { createSvgIcon } from '../utils/create-svg-icon';

export const Share = createSvgIcon(
  'share',
  <>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12.233 11.904v2.37c0 .22.263.332.423.18l5.152-4.895a.25.25 0 0 0-.002-.364l-5.152-4.803a.25.25 0 0 0-.42.183V7C7.724 7 3 8.168 3 12.912v2.085c0 .26.38.364.535.155 2.808-3.78 8.698-3.248 8.698-3.248Z"
    />
  </>,
  {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default Share;
