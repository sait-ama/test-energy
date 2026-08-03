import { createSvgIcon } from '../utils/create-svg-icon';

export const LikeContainedIcon = createSvgIcon(
  'Like',
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M7 12.637c-1.522-.514-5.25-2.771-5.25-6.417A2.918 2.918 0 0 1 7 4.47a2.906 2.906 0 0 1 2.333-1.167c1.61 0 2.917 1.301 2.917 2.917 0 3.652-3.727 5.903-5.25 6.417Z"
  />,
  {
    viewBox: '0 0 14 14',
    stroke: 'currentColor',
  }
);

export default LikeContainedIcon;
