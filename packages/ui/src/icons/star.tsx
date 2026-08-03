import { createSvgIcon } from '../utils/create-svg-icon';

export const StarIcon = createSvgIcon(
  'Star',
  <path
    fill="currentColor"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    d="m10.937 1.593 1.99 4.22c.15.31.43.53.77.58l4.46.68c.83.13 1.17 1.2.56 1.81l-3.23 3.29c-.24.24-.35.6-.29.94l.76 4.64c.14.87-.73 1.53-1.48 1.12l-3.99-2.19a1 1 0 0 0-.95 0l-3.99 2.19c-.75.41-1.62-.25-1.48-1.12l.76-4.64c.06-.34-.05-.7-.29-.94l-3.23-3.29c-.6-.61-.27-1.69.56-1.81l4.46-.68c.33-.05.62-.27.77-.58l1.99-4.22a.995.995 0 0 1 1.82 0h.03Z"
  />,
  {
    viewBox: '0 0 20 20',
  }
);

export default StarIcon;
