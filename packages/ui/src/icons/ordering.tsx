import { createSvgIcon } from '../utils/create-svg-icon';

export const OrderingIcon = createSvgIcon(
  'Ordering',
  <>
    <path
      d="M9.03985 5.59998L5.93982 2.5L2.83984 5.59998"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.94141 15.5V3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.625 14.4004L14.725 17.5004L17.825 14.4004"
      className="stroke-primary"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.7227 4.5V16.5"
      className="stroke-primary"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
  }
);

export default OrderingIcon;
