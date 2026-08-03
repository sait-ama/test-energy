import { memo } from 'react';

export interface FrameProps {
  className?: string;
}

export const Frame = memo((props: FrameProps) => (
  <svg {...props} viewBox="0 0 420 221" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M419 22V200C419 207.18 413.18 213 406 213H222.439C218.06 213 213.9 214.913 211.05 218.238L210 219.463L208.95 218.238C206.1 214.913 201.94 213 197.561 213H14C6.8203 213 1 207.18 1 200V22C1 14.8203 6.8203 9 14 9H197C201.721 9 206.167 6.77709 209 3L210 1.66667L211 3C213.833 6.77709 218.279 9 223 9H406C413.18 9 419 14.8203 419 22Z"
      stroke="hsl(var(--r-foreground))"
      strokeWidth="2"
    />
  </svg>
));
