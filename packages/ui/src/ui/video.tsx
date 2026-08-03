import React from 'react';

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  type?: string;
}

export const Video = React.forwardRef<HTMLVideoElement, VideoProps>(
  ({ className, src, type, ...props }, ref) => {
    return (
      <video ref={ref} className={className} {...props}>
        {src && <source src={src} type={type || 'video/mp4'} />}
      </video>
    );
  }
);

Video.displayName = 'Video';
