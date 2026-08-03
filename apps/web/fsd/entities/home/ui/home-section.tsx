'use client';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import Link from 'next/link';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import type { ContainerProps } from '~shared/ui/container';
import { Container } from '~shared/ui/container';

export interface SectionHeaderProps {
  label?: string;
  link?: string;
  sliderId?: string;
  isLoading?: boolean;
  className?: string;
  action?: ReactNode;
  withUnderline?: boolean;
}

export const HomeSectionHeader = (props: SectionHeaderProps) => {
  const { label, className, withUnderline = true, action, isLoading, link, sliderId } = props;

  const contentType = useContentType();

  const hasLink = link || sliderId;

  const wrapper = (v: ReactNode) =>
    hasLink ? (
      <Link
        shallow={false}
        prefetch={false}
        href={link || `/${contentType}/list/${sliderId}`}
        className="flex gap-2"
      >
        {v}
      </Link>
    ) : (
      v
    );

  return (
    <div
      className={cn('mb-4 flex items-end justify-between gap-4 px-3 max-sm:pl-6 md:p-0', className)}
    >
      <SkeletonSlot
        containerClassName="w-[100px] h-[36px] pt-2 pb-1 flex items-stretch"
        show={isLoading}
        render={wrapper(
          <ReText className="text-xl xl:mb-0.5 xl:text-[1.6rem]" weight="semibold">
            {label}
          </ReText>
        )}
      />
      {action && <div>{action}</div>}
    </div>
  );
};

export const HomeSection = forwardRef<HTMLDivElement, ContainerProps>((props, ref) => {
  const { children, slim = true, className } = props;

  return (
    <Container ref={ref} slim={slim} className={cn('mx-auto px-0', className)}>
      {children}
    </Container>
  );
});
