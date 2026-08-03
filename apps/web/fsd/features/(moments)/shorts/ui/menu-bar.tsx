'use client';

import { ButtonProps } from 'react-day-picker';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Book from '@re/ui-kit/icons/book';
import Comments from '@re/ui-kit/icons/comments';
import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import Filters from '@re/ui-kit/icons/filters';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { LikeMoment } from '~features/like-moment/ui/like-moment';
import { MomentSchema } from '~shared/api/models/inventory';
import { Routing } from '~shared/config/routing';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export const ShortsMomentSources = ({ moment }: { moment?: MomentSchema }) => {
  const contentType = useContentType();

  if (!moment || (!moment.title && !moment.chapter)) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          circle
          size="xl"
          className="flex flex-col items-center justify-center"
        >
          <Book />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {moment.title ? (
          <DropdownMenuItem>
            <Link
              target="_blank"
              href={Routing.Title.detail({
                params: { content: contentType, dir: moment.title.dir, tab: 'main' },
              })}
            >
              К тайтлу
            </Link>
          </DropdownMenuItem>
        ) : null}
        {moment.chapter ? (
          <DropdownMenuItem>
            <Link
              target="_blank"
              href={Routing.Chapter.main({
                params: { content: contentType, titleDir: moment.title.dir, id: moment.chapter.id },
              })}
            >
              К главе
            </Link>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ShortsMenuOtherActions = ({ moment }: { moment?: MomentSchema }) => {
  const t = useTranslations('reusable.actions');

  if (!moment) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" circle size="xl">
          <DotsVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ReportModalAsync target={moment.id} type="moment">
          <DropdownMenuItem className="text-left" withDialog>
            {t('report')}
          </DropdownMenuItem>
        </ReportModalAsync>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const ShortsMenuBarContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative md:mx-16">{children}</div>;
};

export const ShortsMenuBar = ({
  children,
  top,
  bottom,
  header,
}: {
  children: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  header?: React.ReactNode;
}) => {
  return (
    <div
      className="absolute right-0 bottom-0 z-[5] flex h-full flex-col justify-between gap-2 pt-2 md:-right-16 md:px-1.5"
      style={{
        paddingBottom: 'calc((2 * var(--bottom-bar-height)) + env(safe-area-inset-bottom) + 16px)',
      }}
    >
      {header}
      {children || bottom || top ? (
        <div className="flex flex-col gap-1">
          {top}
          {children && (
            <div className="bg-secondary flex flex-col gap-2 rounded-md py-4">{children}</div>
          )}
          {bottom}
        </div>
      ) : null}
    </div>
  );
};

export const ShortsMenuBarFiltersButton = (props: ButtonProps) => {
  return (
    <Button variant="secondary" color="secondary" circle size="xl" {...props}>
      <Filters />
    </Button>
  );
};

export const ShortsMenuLikeButton = ({ moment, className, ...rest }: ButtonProps) => {
  return (
    <LikeMoment
      size="xl"
      circle
      className="flex flex-col items-center justify-center"
      startIconClassName="!mr-0"
      {...rest}
      model={moment}
    >
      {(score) => (
        <ReText color="muted-foreground" size="sm">
          {getAbbreviatedNumber(score)}
        </ReText>
      )}
    </LikeMoment>
  );
};

export const ShortsMenuCommentsButton = ({ moment, className, ...rest }: ButtonProps) => {
  return (
    <Button
      variant="secondary"
      circle
      size="xl"
      className={cn('flex flex-col items-center justify-center', className)}
      {...rest}
    >
      <Comments />
      <ReText color="muted-foreground" size="sm">
        {getAbbreviatedNumber(moment?.count_comments ?? 0)}
      </ReText>
    </Button>
  );
};
