import { createSvgIcon } from '../utils/create-svg-icon';

export const ZoomOut = createSvgIcon(
  'ZoomOut',
  <>
    <path
      d="M8 10.25H12.1667"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.0837 18.0003C14.4559 18.0003 18.0003 14.4559 18.0003 10.0837C18.0003 5.7114 14.4559 2.16699 10.0837 2.16699C5.7114 2.16699 2.16699 5.7114 2.16699 10.0837C2.16699 14.4559 5.7114 18.0003 10.0837 18.0003Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.8337 18.8337L17.167 17.167"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  { viewBox: '-1 0 22 22', fill: 'none', stroke: 'currentColor' }
);

export default ZoomOut;
