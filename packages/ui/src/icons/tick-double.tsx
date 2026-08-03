import { createSvgIcon } from '../utils/create-svg-icon';

export const TickDoubleIcon = createSvgIcon(
  'Target',
  <g width="20" height="20">
    <path
      d="M1.66797 10.8334L4.60665 13.1843C5.29608 13.7359 6.29601 13.6541 6.88664 12.9978L13.3346 5.83337M7.96484 12.0001L9.60665 13.1843C10.2961 13.7359 11.296 13.6541 11.8866 12.9978L18.3346 5.83337"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </g>,
  {
    fill: 'none',
    stroke: '#fff',
    viewBox: '0 0 20 20',
  }
);

export default TickDoubleIcon;
