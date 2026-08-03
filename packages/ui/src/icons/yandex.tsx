import { createSvgIcon } from '../utils/create-svg-icon';

export const YandexIcon = createSvgIcon(
  'yandex',
  <>
    <circle cx={10.18} cy={10} r={10} fill="currentColor" />
    <path
      fill="hsl(var(--r-secondary))"
      d="M9.172 16.875v-1.28c0-1.737-.201-2.596-.895-4.096L4.898 4.167h2.338l2.867 6.272c.84 1.828 1.206 2.779 1.206 4.882v1.554H9.171Zm1.37-6.564 2.666-6.144h2.246l-2.703 6.144h-2.21Z"
    />
  </>,
  {
    viewBox: '0 0 20 20',
  }
);

export default YandexIcon;
