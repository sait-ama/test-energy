'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import ReportIcon from '@re/ui-kit/icons/report';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { TitleKeys } from '~entities/title/model/query-keys';
import { useFollowMutationPostProcess } from '~entities/user-subscriptions/model/mutations';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { useCurrentPageSuspenseTitleDetail } from '../../model/queries';

interface ActionButtonsProps {
  className?: string;
}

export const ActionButtons = ({ className }: ActionButtonsProps) => {
  const { data } = useCurrentPageSuspenseTitleDetail();
  const contentType = useContentType();
  const session = useSession();
  const checkLogged = useLoggedCheck();
  const { mutateAsync } = useFollowMutationPostProcess({
    invalidate: TitleKeys.retrieve({ params: { dir: data.dir } }),
  });
  const t = useTranslations('reusable.actions');

  const { can_update, is_subscribed_cards, can_upload_chapters, admin_link } = data?.meta || {};

  const handleSubscribe = checkLogged(async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({
        operation: is_subscribed_cards ? 'remove' : 'add',
        sub_type: 'title_cards',
        id: data.id,
      });
      toast.success(is_subscribed_cards ? 'Вы отписались от карт' : 'Вы подписаны на карты');
    } catch (error) {
      await resolveErrorAsync(error);
    }
  });

  return (
    <>
      <Media greaterThanOrEqual={Display.md} className={cn('flex flex-col gap-2', className)}>
        <Button
          variant="ghost"
          onClick={handleSubscribe}
          // endIcon={<NotificationIcon/>}
        >
          {is_subscribed_cards ? 'Отписаться от карт' : 'Подписаться на карты'}
        </Button>

        {can_update ? (
          <Button variant="ghost" asChild>
            <Link
              prefetch={false}
              href={Routing.Title.edit({
                params: {
                  content: contentType,
                  dir: data?.dir,
                },
              })}
            >
              Редактировать
            </Link>
          </Button>
        ) : null}

        {can_upload_chapters ? (
          <Button variant="ghost" asChild>
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.Title.editChapters({
                params: {
                  content: contentType,
                  dir: data.dir,
                },
              })}
            >
              Изменить главы
            </Link>
          </Button>
        ) : null}

        {session?.is_staff ? (
          <Button variant="ghost" asChild>
            <Link
              shallow={false}
              prefetch={false}
              href={UrlFormatter.createUrl(publicEnv('PANEL_URL'), `/titles/${data.id}/show/`)}
            >
              Модерка
              {/*<Admin size={20} />*/}
            </Link>
          </Button>
        ) : null}

        {session?.is_staff ? (
          <Button variant="ghost" asChild>
            <Link
              shallow={false}
              prefetch={false}
              href={UrlFormatter.createUrl(
                publicEnv('ADMIN_URL'),
                `/titles/title/${data.id}/change/`
              )}
            >
              Админка
              {/*<Panel size={20} />*/}
            </Link>
          </Button>
        ) : null}

        <ReportModalAsync type="title" target={data?.id}>
          <Button variant="outline" endIcon={<ReportIcon />}>
            {t('report')}
          </Button>
        </ReportModalAsync>
      </Media>
      <Media lessThan={Display.md} className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" size="xl" className="flex items-center !p-0">
              <DotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {can_update ? (
              <DropdownMenuItem {...TestProps.id(`change_battle_btn`)} asChild>
                <Link
                  prefetch={false}
                  href={Routing.Title.edit({
                    params: {
                      content: contentType,
                      dir: data?.dir,
                    },
                  })}
                >
                  Редактировать
                </Link>
              </DropdownMenuItem>
            ) : null}
            {can_upload_chapters ? (
              <DropdownMenuItem {...TestProps.id(`change_chapters_btn`)} asChild>
                <Link
                  shallow={false}
                  prefetch={false}
                  href={Routing.Title.editChapters({
                    params: {
                      content: contentType,
                      dir: data?.dir,
                    },
                  })}
                >
                  Изменить главы
                </Link>
              </DropdownMenuItem>
            ) : null}

            {session?.is_staff ? (
              <DropdownMenuItem asChild>
                <Link
                  shallow={false}
                  prefetch={false}
                  href={UrlFormatter.createUrl(publicEnv('PANEL_URL'), `/titles/${data.id}/show/`)}
                >
                  Модерка
                  {/*<Admin size={20} />*/}
                </Link>
              </DropdownMenuItem>
            ) : null}

            {session?.is_staff ? (
              <DropdownMenuItem asChild>
                <Link
                  shallow={false}
                  prefetch={false}
                  href={UrlFormatter.createUrl(
                    publicEnv('ADMIN_URL'),
                    `/titles/title/${data.id}/change/`
                  )}
                >
                  Админка
                  {/*<Panel size={20} />*/}
                </Link>
              </DropdownMenuItem>
            ) : null}

            {can_update || can_upload_chapters || admin_link ? <DropdownMenuSeparator /> : null}
            <ReportModalAsync type="title" {...TestProps.id(`report_btn`)} target={data?.id}>
              <DropdownMenuItem withDialog className="flex w-full items-center justify-between">
                <ReText size="sm" color="destructive" leading="none">
                  {t('report')}
                </ReText>
                <ReportIcon className="text-destructive" />
              </DropdownMenuItem>
            </ReportModalAsync>
          </DropdownMenuContent>
        </DropdownMenu>
      </Media>
    </>
  );
};
