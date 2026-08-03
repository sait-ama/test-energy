import { createSvgIcon } from '../utils/create-svg-icon';

export const NewYearUnderlineIcon = createSvgIcon(
  'newYearUnderline',
  <>
    <defs>
      <pattern
        patternTransform="rotate(45)"
        id="diagonalPattern"
        patternUnits="userSpaceOnUse"
        width="10"
        height="40"
      >
        <rect
          x="0"
          y="0"
          width="50"
          height="40"
          fill="var(--newyear-underline-color-1)"
          opacity={0.8}
        />
        <rect
          x="5"
          y="0"
          width="50"
          height="40"
          fill="var(--newyear-underline-color-2)"
          opacity={0.8}
        />
      </pattern>
    </defs>

    <path
      d="M3 7C4.35618 6.50878 45.5842 -1.02322 94 5.9357"
      strokeWidth="5"
      strokeLinecap="round"
      stroke="url(#diagonalPattern)"
    />
  </>,
  {
    viewBox: '0 0 97 10',
    preserveAspectRatio: 'none',
    fill: 'none',
  }
);

export default NewYearUnderlineIcon;
