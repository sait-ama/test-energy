import Image from 'next/image';

import { cn } from '@re/ui-kit/utils/cn';

export const BaseImage = ({
  width,
  height,
  src,
  className,
}: {
  width: number;
  height: number;
  src: string;
  className?: string;
}) => (
  <div
    className="absolute bottom-0 left-1/2 select-none"
    style={{ transform: 'translate(-50%, 77px)' }}
  >
    <div
      className="after:to-background relative after:absolute after:bottom-[-2px] after:left-0 after:block after:size-full after:bg-gradient-to-b after:from-transparent after:content-['']"
      style={{ width, height }}
    >
      <Image
        priority
        width={width}
        height={height}
        className={cn('pb-[2px] select-none', className)}
        src={src}
        alt="Изображение ошибки"
      />
    </div>
  </div>
);
