'use client';
import React, { ComponentProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import ExternalLinkIcon from '@re/ui-kit/icons/external-link';
import { buttonVariants } from '@re/ui-kit/ui/button';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { InfoModalType } from '~shared/api/models/info-modal';
import { Badge } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface BadgeCardProps extends ComponentProps<'div'> {
  model: Badge;
  withHover?: boolean;
}

export const BadgeCard = (props: BadgeCardProps) => {
  const { model, className, withHover, ...rest } = props;

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        { ['group cursor-pointer']: withHover },
        className
      )}
      {...rest}
    >
      <Image
        draggable={false}
        unoptimized
        src={UrlFormatter.media(model.icon)}
        alt={model.name}
        width={80}
        height={80}
        className="group:scale-105 aspect-square rounded-full object-cover select-none"
      />

      <ReText
        align="center"
        component="span"
        className="break-word text-xs md:text-sm"
        lineClamp={2}
        color="muted-foreground"
        dangerouslySetInnerHTML={{ __html: model.name }}
      />
    </div>
  );
};

interface BadgePreviewProps extends ComponentProps<'div'> {
  model: Badge;
}

export const BadgePreview = (props: BadgePreviewProps) => {
  const { model, ...className } = props;

  return (
    <div className={cn('flex flex-col p-6', className)}>
      <div className="relative mb-4">
        <Image
          src={UrlFormatter.media(model.icon)}
          alt={model.name}
          width={400}
          height={400}
          unoptimized
          draggable={false}
          className="w-full self-center rounded-md object-cover select-none"
        />
      </div>
      <ReText weight="semibold" size="lg" className="'mt-4 flex items-center gap-1">
        {model.name}
      </ReText>

      {model.description ? (
        <ReText
          size="sm"
          align="left"
          component="p"
          className="mt-2 break-words"
          color="muted-foreground"
          dangerouslySetInnerHTML={{ __html: model.description }}
        />
      ) : null}
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.Badge.detail({ params: { id: model.id } })}
        target="_blank"
        className={cn(
          buttonVariants({
            variant: 'secondary',
            className: 'mt-4 flex items-center gap-2 self-center',
          })
        )}
      >
        Владельцы <ExternalLinkIcon />
      </Link>
    </div>
  );
};

interface BadgeWithModalProps extends BadgeCardProps {}

export const BadgeWithModal = (props: BadgeWithModalProps) => {
  const open = useInfoModal((v) => v.open);

  const handleClick = () => {
    open({
      type: InfoModalType.CUSTOM,
      content: <BadgePreview model={props.model} />,
      srOnly: 'Превью достижения',
      contentProps: {
        className: '!max-w-lg border-none p-0',
      },
    });
  };

  return <BadgeCard {...props} withHover onClick={handleClick} />;
};

export const BadgeSkeleton = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { className, ...rest } = props;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <SkeletonV2 className={cn('bg-skeleton size-20 rounded-full', className)} {...rest} />
      <div className="flex w-full flex-col items-center gap-1">
        <SkeletonV2 className="bg-skeleton flex h-4 w-3/4 items-center" />
        <SkeletonV2 className="bg-skeleton flex h-4 w-2/5 items-center" />
      </div>
    </div>
  );
};
