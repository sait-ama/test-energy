import { createSvgIcon } from '../utils/create-svg-icon';

export const QuestionMarkIcon = createSvgIcon(
  'question-mark',
  <>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.003 1.667c-4.584 0-8.334 3.75-8.334 8.333s3.75 8.333 8.334 8.333c4.583 0 8.333-3.75 8.333-8.333s-3.75-8.333-8.333-8.333ZM10 13.333V9.167"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.008 6.667H10" />
  </>,
  {
    viewBox: '0 0 20 20',
    stroke: 'currentColor',
    fill: 'none',
  }
);

export default QuestionMarkIcon;
