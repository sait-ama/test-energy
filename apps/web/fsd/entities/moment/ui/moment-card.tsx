import * as React from 'react';
import { ComponentProps } from 'react';
import Link from 'next/link';

import EyeCrossed from '@re/ui-kit/icons/eye-crossed';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import * as MediaPrimitive from '@re/ui-kit/ui/media';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { MomentSchema } from '~shared/api/models/inventory';
import Title from '~shared/assets/placeholders/title';
import { Routing } from '~shared/config/routing';
import { linkBaseVariants } from '~shared/ui/link-base';
import { RichText } from '~shared/ui/rich-text';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface MomentCardRootProps extends ComponentProps<'div'> {}

export const MomentCardRoot = (props: MomentCardRootProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
};

interface MomentCardBackgroundProps extends ComponentProps<'div'> {
  src: string;
}

export const MomentCardBackground = (props: MomentCardBackgroundProps) => {
  const { className, style, src, ...rest } = props;

  return (
    <div
      {...rest}
      className={cn('absolute inset-0 h-full w-full opacity-30 blur-md', className)}
      style={{
        ...style,
        background: `url(${src}) no-repeat center/cover`,
      }}
    />
  );
};

interface MomentCardSpoilerIndicatorProps extends ComponentProps<'div'> {}

export const MomentCardSpoilerIndicator = (props: MomentCardSpoilerIndicatorProps) => {
  const { className, ...rest } = props;

  return (
    <div
      className={cn(
        'absolute inset-0 z-[5] flex size-full flex-col items-center justify-center gap-2 px-4',
        className
      )}
      {...rest}
    >
      <EyeCrossed className="dark:text-muted-foreground text-primary-foreground size-12" />
      {/*<ReText align="center">Момент содержит спойлеры!</ReText>*/}
      <ReText
        align="center"
        size="sm"
        className="dark:text-muted-foreground text-primary-foreground leading-none"
      >
        Нажмите, чтобы посмотреть
      </ReText>
    </div>
  );
};

export interface MomentCardImageProps {
  src: string;
  className?: string;
}

export const MomentCardImage = (props: MomentCardImageProps) => {
  const { src, className, ...rest } = props;

  return (
    <MediaPrimitive.Root
      src={UrlFormatter.media(src)}
      className="relative flex w-full justify-center select-none"
    >
      <MediaPrimitive.Content
        alt="Moment Preview"
        className={cn('object-contain select-none', className)}
        {...rest}
      />
      <MediaPrimitive.Fallback>
        <Title size={20} style={{ fill: 'var(--r-muted-foreground)' }} />
      </MediaPrimitive.Fallback>
    </MediaPrimitive.Root>
  );
};

export interface MomentCardAuthorProps extends ComponentProps<'div'> {
  model: MomentSchema;
}

export const MomentCardAuthor = (props: MomentCardAuthorProps) => {
  const { model, className, ...rest } = props;

  if (!model.author) return null;

  return (
    <Button color="secondary" asChild>
      <Link
        {...rest}
        className={cn('flex gap-2', className)}
        href={Routing.User.detail({
          params: {
            id: model.author.id,
            tab: 'about',
          },
        })}
      >
        Добавил: {model.author.username}
        {/*<ExternalLink />*/}
      </Link>
    </Button>
  );
};

interface MomentCardDescriptionProps extends ComponentProps<'div'> {
  lineClamp?: number;
}

export const MomentCardDescription = (props: MomentCardDescriptionProps) => {
  const { className, children, style, lineClamp, ...rest } = props;

  if (!children) return null;

  return (
    <div className={cn('z-[5] overflow-hidden', className)} {...rest}>
      <RichText style={{ fontSize: 12, ...style }} lineClamp={lineClamp}>
        {children}
      </RichText>
    </div>
  );
};

interface MomentCardTitleProps extends ComponentProps<'a'> {
  model: MomentSchema;
}

export const MomentCardTitle = (props: MomentCardTitleProps) => {
  const { model, className, ...rest } = props;
  const contentType = useContentType();

  return (
    <Link
      href={Routing.Title.detail({
        params: {
          dir: model.title!.dir!,
          content: contentType,
          tab: 'main',
        },
      })}
      className="flex items-center gap-2"
      {...rest}
    >
      <ReText
        size="lg"
        weight="medium"
        className={linkBaseVariants({
          variant: 'secondary',
          className: cn('text-foreground', className),
        })}
      >
        {model!.title!.main_name}
      </ReText>
    </Link>
  );
};

interface MomentCardChapterProps extends ComponentProps<'a'> {
  model: MomentSchema;
}

export const MomentCardChapter = (props: MomentCardChapterProps) => {
  const { model, className, ...rest } = props;
  const contentType = useContentType();

  if (!model?.chapter) return null;

  return (
    <Link
      href={Routing.Chapter.main({
        params: {
          titleDir: model.title!.dir!,
          content: contentType,
          id: model.chapter.id,
        },
      })}
      className="flex items-center gap-2"
      {...rest}
    >
      <ReText
        size="md"
        weight="medium"
        className={linkBaseVariants({
          variant: 'secondary',
          className: cn('text-foreground', className),
        })}
      >
        {model?.chapter?.chapter} глава
      </ReText>
    </Link>
  );
};

interface MomentCardTagsProps extends ComponentProps<'div'> {
  model: MomentSchema;
}

export const MomentCardTags = (props: MomentCardTagsProps) => {
  const { model, className, ...rest } = props;

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)} {...rest}>
      {model.tags.map((it) => (
        <Badge key={it.id} variant="secondary">
          {it.name}
        </Badge>
      ))}
    </div>
  );
};
