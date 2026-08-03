'use client';
import type { MouseEventHandler, ReactNode } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import Telegram from '@re/ui-kit/icons/telegram';
import { Alert, AlertDescription, AlertTitle } from '@re/ui-kit/ui/alert';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { Textarea } from '@re/ui-kit/ui/textarea';
import { cn } from '@re/ui-kit/utils/cn';
import { captureFeedback, captureMessage } from '@sentry/nextjs';

import { FeedbackRepository } from '~entities/feedback/model/repository';
import {
  TYPE_DESCRIPTION,
  TYPE_HEADING,
  TYPE_ICON,
  TYPE_NAME,
} from '~entities/feedback/model/types';
import { collectSettings } from '~entities/feedback/model/utils';
import type { FeedbackFormSchema } from '~entities/feedback/model/validators';
import { FeedbackFormValidator } from '~entities/feedback/model/validators';
import { FeedBackType } from '~shared/api/models/feedback';
import { Routing } from '~shared/config/routing';
import { useOpen } from '~shared/hooks/use-open';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { STORAGE_KEY } from '~shared/lib/version-control/version-control';
import { useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import type { FeedbackTriggerButtonProps } from './feedback-trigger-button';
import { FeedbackTriggerButton } from './feedback-trigger-button';

const defaultTypes = [
  FeedBackType.GoodFeedback,
  FeedBackType.BadFeedback,
  FeedBackType.Bugs,
  FeedBackType.Ideas,
];

export interface FeedbackProps {
  types?: FeedBackType[];
  onSubmit?: (values: FeedbackFormSchema) => void;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export const Feedback = (props: FeedbackProps) => {
  'use no memo';

  const { types = defaultTypes, onSubmit: onSubmitFunc, onClick, className } = props;
  const user = useSession();
  const [loading, setLoading] = useState(false);
  const { register, setValue, getValues, watch, handleSubmit } = useForm({
    schema: FeedbackFormValidator,
    defaultValues: {
      type: types.length === 1 ? types[0] : undefined,
      description: '',
      name: '',
    },
  });

  const { type } = watch();
  const pathName = usePathname();
  const FeedbackTab = ({ id, children }: { id: number; children: ReactNode }) => (
    <div
      className={cn(
        'border-border flex cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border p-4',
        {
          ['bg-primary']: type === id,
        }
      )}
      onClick={() => {
        setValue('type', id);
      }}
    >
      {children}
    </div>
  );
  const pathname = usePathname();
  const FeedbackContent = ({ id, children }: { id: number | string; children: ReactNode }) => {
    if (id !== type) return null;

    return children;
  };
  const [isCollection, setIsCollection] = useState(false);
  const onBugSubmit = async () => {
    const eventId = captureMessage('User Feedback');
    const settings = collectSettings(pathName, {
      base: { key: STORAGE_KEY, source: 'localStorage' },
    });
    captureFeedback({
      associatedEventId: eventId,
      tags: settings,
      message: 'bug',
      url: pathname,
      email: user?.email,
    });
    setIsCollection(false);

    window.open(
      Routing.BotBugReportTg.get({ query: { userId: user?.id! || '', eventId } }),
      '_blank'
    );
  };
  const onSubmit = async () => {
    const values = getValues();
    const toast = await importToastAsync();

    values.description += `\nUser ID: ${user?.id}`;

    if (values.type === FeedBackType.Bugs) {
      values.description += `\nБаг произошел на сайте\nUser-Agent: ${navigator.userAgent} \nСтраница: ${window.location.href} \nНастройки читалки:`;
      // ${
      // localStorageWrapper.get(`c${contentType}Settings`) ?? '{}'
      // } \n
    }

    try {
      setLoading(true);

      await FeedbackRepository.createFeedback({ data: values });
      if (onSubmitFunc) onSubmitFunc(values);
      toast.success('Фидбек успешно отправлен. Спасибо за участие в жизни сайта!');
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);

      // toast.error(e?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)} onClick={onClick}>
      <ReText size="xl" weight="semibold">
        Обратная связь
      </ReText>
      <Alert>
        Мы стараемся отвечать на все ваши сообщения, поэтому, пожалуйста, удостоверьтесь, что у
        вас&nbsp;
        <b>привязана хотя бы одна соц. сеть</b> для связи.
      </Alert>

      <form
        onSubmit={handleSubmit(onSubmit, console.log)}
        className="grid grid-cols-2 grid-rows-2 gap-3"
      >
        {types.length !== 1
          ? types.map((type) => {
              const Icon = TYPE_ICON[type];
              return (
                <FeedbackTab key={type} id={type}>
                  {Icon && <Icon className="size-6" />}
                  <ReText>{TYPE_NAME[type]}</ReText>
                </FeedbackTab>
              );
            })
          : null}
      </form>
      <FeedbackContent id={FeedBackType.Bugs}>
        <Alert severity="error">
          <AlertTitle>Обратите внимание!</AlertTitle>
          <AlertDescription>
            Нам жаль, что вы столкнулись с багом. Чтобы мы могли его оперативно исправить,
            поделитесь деталями:
            <br />
            1) Когда и где баг появляется? Например, после чтения 2-3 глав.
            <br />
            2) Прикрепите видео, если возможно. Ссылку оставьте здесь.
            <br />
            3) Где вы живете? (регион, город)
            <br />
            4) Укажите своего провайдера.
            <br />
            <br />
            Спасибо за терпение и помощь в улучшении нашего сервиса!
          </AlertDescription>
        </Alert>
      </FeedbackContent>
      {type !== FeedBackType.Bugs ? null : (
        <Button
          loading={isCollection}
          onClick={async () => {
            setIsCollection(true);
            await onBugSubmit();
          }}
          className="w-full max-w-md md:m-auto"
          size="lg"
          startIcon={<Telegram className="size-6" />}
        >
          Re:Бот
        </Button>
      )}
      {type && type !== FeedBackType.Bugs ? (
        <>
          <div className="flex flex-col gap-1">
            <Input {...register('topic', { required: true })} placeholder={TYPE_HEADING[type]} />
            <Textarea
              {...register('description', { required: true })}
              placeholder={TYPE_DESCRIPTION[type]}
              rows={10}
            />
          </div>

          <div>
            <Button type="submit" color="primary" onClick={onSubmit} disabled={loading}>
              Отправить
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export type FeedbackButtonProps = FeedbackProps & FeedbackTriggerButtonProps;

export const FeedbackButton = (props: FeedbackButtonProps) => {
  const [open, toggle, close] = useOpen();
  const { color = 'gray', style, types, children, onSubmit } = props;

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <FeedbackTriggerButton {...props} color={color} style={style}>
          {children}
        </FeedbackTriggerButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogTitle className="sr-only">Форма обратной связи</DialogTitle>

        <Feedback
          types={types}
          onSubmit={(values) => {
            close();
            onSubmit?.(values);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="overflow-auto"
        />
      </DialogContent>
    </Dialog>
  );
};
