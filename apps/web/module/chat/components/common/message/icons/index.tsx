import { createSvgIcon } from '@re/ui-kit/utils/create-svg-icon';

export const ActionsIcon = createSvgIcon(
  'Actions',
  <>
    <path
      d="M1.5 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
      fillRule="nonzero"
    />
  </>,
  { viewBox: '0 0 11 4' }
);

export const ReactionIcon = createSvgIcon(
  'Reaction',
  <>
    <g clipRule="evenodd" fillRule="evenodd">
      <path d="M6 1.2C3.3 1.2 1.2 3.3 1.2 6c0 2.7 2.1 4.8 4.8 4.8 2.7 0 4.8-2.1 4.8-4.8 0-2.7-2.1-4.8-4.8-4.8zM0 6c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6z" />
      <path d="M5.4 4.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9.4-.9.9-.9.9.4.9.9zM8.4 4.5c0 .5-.4.9-.9.9s-.9-.4-.9-.9.4-.9.9-.9.9.4.9.9zM3.3 6.7c.3-.2.6-.1.8.1.3.4.8.9 1.5 1 .6.2 1.4.1 2.4-1 .2-.2.6-.3.8 0 .2.2.3.6 0 .8-1.1 1.3-2.4 1.7-3.5 1.5-1-.2-1.8-.9-2.2-1.5-.2-.3-.1-.7.2-.9z" />
    </g>
  </>,
  { viewBox: '0 0 12 12' }
);

export const ThreadIcon = createSvgIcon(
  'Thread',
  <>
    <path
      d="M8.516 3c4.78 0 4.972 6.5 4.972 6.5-1.6-2.906-2.847-3.184-4.972-3.184v2.872L3.772 4.994 8.516.5V3zM.484 5l4.5-4.237v1.78L2.416 5l2.568 2.125v1.828L.484 5z"
      fillRule="evenodd"
    />
  </>,
  {}
);

export const PinIcon = createSvgIcon(
  'Pin',
  <>
    <path
      d="M13.3518 6.686L6.75251 0.0866699L5.80984 1.02867L6.75318 1.972V1.97334L3.45318 5.272L3.45251 5.27334L2.50984 4.32934L1.56718 5.27267L4.39584 8.10067L0.624512 11.8713L1.56718 12.814L5.33851 9.04334L8.16718 11.8713L9.10984 10.9293L8.16718 9.986L11.4672 6.686L12.4098 7.62867L13.3518 6.686ZM7.22451 9.04267L7.22385 9.04334L4.39584 6.21467L7.69518 2.91467L10.5232 5.74267L7.22451 9.04267Z"
      fillRule="evenodd"
    />
  </>,
  { viewBox: '0 0 14 13' }
);

export const MessageDeliveredIcon = createSvgIcon(
  'MessageDelivered',
  <>
    <path
      d="M1.66699 10.834L4.60568 13.1849C5.29511 13.7365 6.29503 13.6547 6.88566 12.9984L13.3337 5.83398M7.96387 12.0007L9.60568 13.1849C10.2951 13.7365 11.295 13.6547 11.8857 12.9984L18.3337 5.83398"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>,
  { viewBox: '0 0 20 20' }
);

export const MessageErrorIcon = createSvgIcon(
  'MessageError',
  <>
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
      fill="currentColor"
      id="background"
    />
    <path d="M13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="white" />
  </>,
  { viewBox: '0 0 24 24' }
);
