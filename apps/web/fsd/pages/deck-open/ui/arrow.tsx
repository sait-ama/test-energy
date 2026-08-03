export type ArrowProps = {
  className?: string;
};

export const Arrow = ({ className }: ArrowProps) => (
  <svg
    className={className}
    width="383"
    height="80"
    viewBox="0 0 383 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M383 14C383 6.26801 376.732 0 369 0H43.4125C39.9298 0 36.5721 1.2981 33.9951 3.64084L5.39509 29.6408C-0.71502 35.1955 -0.715029 44.8045 5.39508 50.3592L33.9951 76.3592C36.5721 78.7019 39.9298 80 43.4125 80H369C376.732 80 383 73.732 383 66V14Z"
      fill="#3C82F6"
    />
  </svg>
);
