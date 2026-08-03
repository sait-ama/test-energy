import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

export interface VideoProps extends ComponentPropsWithoutRef<'video'> {
  type?: string;
}

export const Video = forwardRef<HTMLVideoElement, VideoProps>(
  ({ src, type = 'video/webm', ...other }, ref) => (
    <video {...other} ref={ref}>
      <source src={src} type={type} />
    </video>
  )
);
