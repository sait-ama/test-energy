import type { MouseEvent } from 'react';
import { lazy, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import DayJS from 'dayjs';

import DotsHorizontal from '@re/ui-kit/icons/dots-horizontal';
import Forward from '@re/ui-kit/icons/forward';
import { AccordionIndicator } from '@re/ui-kit/ui/accordion';
import { Button } from '@re/ui-kit/ui/button';
import { Card } from '@re/ui-kit/ui/card';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { replaceHtmlEntities } from '~entities/activity/ui/utils';
import { useReadNotifications } from '~entities/notification/model/mutations';
import { useNotificationsStatus, useNotificationStore } from '~entities/notification/model/store';
import { DeleteNotificationsGroupButton } from '~features/notifications-actions/ui/delete-notifications-button';
import { api } from '~shared/api/$api';
import { InfoModalType } from '~shared/api/models/info-modal';
import type { NotificationSchema } from '~shared/api/models/notifications';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { logger } from '~shared/lib/logger';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { UrlFormatter } from '~shared/utils/url-formatter';

const NotificationsComments = lazy(() =>
  import(
    /* webpackChunkName: "NotificationsComments" */ '~widgets/activity/ui/notifications-comments'
  ).then((m) => ({ default: m.NotificationsComments }))
);

interface NotificationSublistActionsProps {
  model: NotificationSchema;
}

const NotificationSublistActions = memo((props: NotificationSublistActionsProps) => {
  const { model } = props;

  return (
    <div className="mr-3 flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" circle>
            <DotsHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DeleteNotificationsGroupButton id={model.title} />
          {/*  todo: а где кнопка отметить как прочитанное?  */}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center justify-center gap-2">
        <ReText>{model.total}</ReText>
        <AccordionIndicator className="!ml-0" />
      </div>
    </div>
  );
});

interface NotificationCardProps {
  model: NotificationSchema;
  isSublist?: boolean;
  isSubItem?: boolean;
  groupIds?: number[];
}

export const NotificationCard = memo((props: NotificationCardProps) => {
  const { model, isSublist, isSubItem } = props;

  const { handleSelect, selectedIds } = useNotificationStore();
  const getConfirmation = useGetConfirmation();
  const { open: openInfoModal, close } = useInfoModal();
  const params = useParams();
  const { value } = useNotificationsStatus();
  const { mutateAsync } = useReadNotifications({ query: { status: value, type: params.dir } });

  const router = useRouter();
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  const handleReroute = () => {
    router.push(model.link);
    close();
  };

  const handleClick = async (e: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLDivElement>) => {
    // if (isSublist) return;

    if (model.action === 2) {
      e.preventDefault();

      const confirmed = await getConfirmation({
        description: model.text,
        closeText: 'Нет',
        confirmText: 'Да',
      });

      if (confirmed) {
        try {
          await api.post(model.link, {});
        } catch (e: unknown) {
          logger.error(e);
          await resolveErrorAsync(e);
        }
      }

      // return;
    }

    if (model.action === 3) {
      e.preventDefault();

      openInfoModal({
        srOnly: 'Ответ на комментарий',
        type: InfoModalType.CUSTOM,
        title: 'Ответ на комментарий',
        content: (
          <>
            <div className="flex justify-between">
              <Button
                endIcon={<Forward />}
                style={{ height: 'auto' }}
                onClick={handleReroute}
                variant="link"
              >
                На страницу-источник
              </Button>
            </div>
            {/*// @ts-ignore*/}
            <NotificationsComments target={{ commentId: model.comment }} />
          </>
        ),
      });
      // return;
    }

    if (!model.status) {
      try {
        await mutateAsync({ type: model.type, notification: `${model.id}` });
      } catch (e: unknown) {
        logger.error(e);
        await resolveErrorAsync(e);
      }
    }
  };

  const handleCheck = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    handleSelect(model.id);
  };

  const Component = model.link ? Link : 'div';

  return (
    <Card
      className={cn(
        {
          'border-border ml-4 border': isSubItem,
          'w-full': !isSubItem,
          'border-l-border-success': isSublist,
        },
        'bg-card flex cursor-pointer items-center justify-between'
      )}
    >
      <Component
        prefetch={false}
        href={
          model.link?.startsWith('http')
            ? model.link
            : model?.link?.startsWith('/')
              ? model.link
              : `/${model.link}`
        }
        onClickCapture={handleClick}
        className="w-full"
      >
        <div className="flex items-center gap-3 p-3">
          <Image
            src={UrlFormatter.media(model.img || '/media/512logo.png')}
            width="40"
            height="60"
            className="rounded-xs select-none"
            alt="Картинка комментария"
          />

          <div className="flex flex-col items-start gap-1">
            <ReText
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
              className={cn('text-left break-words break-all', {
                'hover:text-primary transition-colors duration-300': model.link,
              })}
              dangerouslySetInnerHTML={{
                __html: sanitizeSync(replaceHtmlEntities(model?.text || '')) || '',
              }}
            />
            <ReText size="sm" color="muted-foreground">
              {DayJS(model.date).format(dateFormat)}
            </ReText>
          </div>
        </div>
      </Component>
      {isSublist ? (
        <NotificationSublistActions model={model} />
      ) : (
        <div onClick={handleCheck} className="p-4">
          <Checkbox checked={selectedIds.includes(model.id as number)} className="mr-4" />
        </div>
      )}
    </Card>
  );
});
