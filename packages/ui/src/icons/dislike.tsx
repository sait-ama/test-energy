import { createSvgIcon } from '../utils/create-svg-icon';

export const DislikeIcon = createSvgIcon(
  'dislike',
  <>
    <path
      d="M10 16.6666C7.825 15.9333 2.5 12.7083 2.5 7.49998C2.5 5.19998 4.36667 3.33331 6.66667 3.33331C8.03333 3.33331 9.24167 3.99165 10 4.99998C10.7583 3.98331 11.975 3.33331 13.3333 3.33331C15.6333 3.33331 17.5 5.19165 17.5 7.49998C17.5 12.7166 12.175 15.9333 10 16.6666Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 5L9.29817 7.10548C9.13074 7.60779 9.38386 8.15354 9.87547 8.35019L10.5715 8.62861C11.0843 8.83372 11.3337 9.41569 11.1286 9.92848L10.5 11.5"
      strokeWidth="1.5"
      color="hsl(var(--r-foreground-inverted))"
      strokeLinecap="round"
    />
  </>,
  {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default DislikeIcon;
