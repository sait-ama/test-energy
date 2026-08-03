import { CSSProperties, forwardRef, memo, ReactNode } from 'react';
import Link from 'next/link';

import Premium from '@re/ui-kit/icons/premium';
import { AvatarSkeletonSlot } from '@re/ui-kit/ui/avatar';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import type { UserCardOwnerSchema } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';

export type VerticalUserV2Card = Pick<
  UserCardOwnerSchema,
  'avatar' | 'username' | 'id' | 'tagline' | 'is_premium' | 'frame'
>;

export interface VerticalCardV2Props<T extends VerticalUserV2Card> {
  model: T | null;
  isLoading?: boolean;
  subtitle?: ReactNode;
  className?: string;
  footer?: ReactNode;
  extra?: ReactNode;
  style?: CSSProperties;
}

export const VerticalUserCard = forwardRef<
  HTMLAnchorElement,
  VerticalCardV2Props<VerticalUserV2Card>
>((props, ref) => {
  const { model, footer, isLoading, subtitle, className, ...rest } = props;
  const { id, username, avatar, is_premium, frame, tagline } = model ?? {};

  const content = (
    <div
      className={cn('border-border flex flex-col items-center rounded-sm border p-2', className)}
      {...rest}
    >
      <SkeletonSlot
        className="size-20"
        render={
          <UserAvatar
            frameSrc={frame?.high}
            avatarSrc={avatar?.mid}
            alt={username!}
            className="aspect-square w-full rounded-sm object-cover select-none"
            size={80}
          />
        }
        show={isLoading}
      />

      <div className="flex items-center gap-2">
        <ReText
          size="md"
          align="center"
          component="span"
          className="mt-2 break-all"
          lineClamp={1}
          weight="semibold"
        >
          <SkeletonSlot count={0.7} render={username} show={isLoading} />
        </ReText>
        <div className="mt-1">{is_premium ? <Premium /> : null}</div>
      </div>

      <ReText
        size="sm"
        align="center"
        component="span"
        className="mt-2 w-full break-all"
        lineClamp={2}
        color="muted-foreground"
      >
        <SkeletonSlot count={0.7} render={subtitle || tagline} show={isLoading} />
      </ReText>
      {footer}
    </div>
  );

  if (isLoading) return content;

  return (
    <Link
      prefetch={false}
      href={Routing.User.detail({ params: { id, tab: 'about' } })}
      ref={ref}
      className="flex"
    >
      {content}
    </Link>
  );
});

export const VerticalUserCardV2 = memo(
  forwardRef<HTMLAnchorElement, VerticalCardV2Props<VerticalUserV2Card>>((props, ref) => {
    const {
      model,
      footer,
      extra,
      subtitle = model?.tagline,
      isLoading,
      className,
      ...rest
    } = props;
    const { id, username, avatar, is_premium, frame } = model ?? {};

    return (
      <Link href={Routing.User.detail({ params: { id, tab: 'about' } })} prefetch={false} ref={ref}>
        <div
          className={cn('flex flex-col gap-2 overflow-hidden rounded-md p-2', className)}
          {...rest}
        >
          <AvatarSkeletonSlot
            show={isLoading}
            render={() => (
              <div
                className={cn('h-full w-full', {
                  'p-[6%]': !!frame?.high,
                })}
              >
                <UserAvatar
                  bottomSlot={extra}
                  withHover
                  imgClassName="w-full"
                  avatarSrc={avatar?.mid || null}
                  frameSrc={frame?.high || null}
                  alt={username!}
                  // style={{ height: 'auto', width: '100%' }}
                  className="aspect-square h-full w-full rounded-sm object-cover select-none"
                />
              </div>
            )}
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <ReText
                size="sm"
                weight="semibold"
                component="span"
                className="break-all"
                lineClamp={1}
              >
                <SkeletonSlot count={0.7} render={username} show={isLoading} />
              </ReText>
              <div>{is_premium ? <Premium className="size-4" /> : null}</div>
            </div>

            <ReText
              size="xs"
              component="span"
              className="w-full break-all"
              lineClamp={2}
              color="muted-foreground"
            >
              <SkeletonSlot count={0.7} render={subtitle} show={isLoading} />
            </ReText>
          </div>
          {footer}
        </div>
      </Link>
    );
  })
);
