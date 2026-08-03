import { createSvgIcon } from '../utils/create-svg-icon';

export const CardIcon = createSvgIcon(
  'card',
  <>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="42">
      🎴
    </text>
  </>,
  {
    viewBox: '0 -5 44 42',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default CardIcon;
