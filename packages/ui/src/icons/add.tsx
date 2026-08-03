import { createSvgIcon } from '../utils/create-svg-icon';

export const AddIcon = createSvgIcon(
  'Add',
  <>
    <path d="M5 10H15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 15V5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </>,
  {
    viewBox: '0 0 20 20',
    stroke: 'currentColor',
    fill: 'none',
  }
);

export default AddIcon;
