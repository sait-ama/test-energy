'use client';
import type { ComponentProps, MouseEventHandler, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Image from 'next/image';

import { entriesRetrieveOptions } from '@re/api/generated/@tanstack/react-query.gen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from '@re/ui-kit/ui/alert-dialog';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import type { DialogContentProps, DialogProps } from '@re/ui-kit/ui/dialog';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { Slot } from '@re/ui-kit/ui/slot';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { EntryContent, EntryRoot, EntryTitle } from '~entities/entry/ui/entry';
import { client } from '~shared/api/client';
import { InfoModalType } from '~shared/api/models/info-modal';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface EntryModalContentProps {
  entryId: NumberIsomorphic;
}

interface AlertModalContentProps {
  title: ReactNode;
  onAction: () => void;
  actionButtonProps: Omit<ButtonProps, 'onClick'>;
}

const AlertModalContent = ({
  title,
  onAction,
  actionButtonProps: { className, ...props },
}: AlertModalContentProps) => {
  return (
    <AlertDialogContent>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <div className="flex gap-4">
        <AlertDialogCancel className="px-4">Отмена</AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button className={cn('z-10 px-4', className)} onClick={onAction} {...props}>
            Продолжить
          </Button>
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  );
};

const EntryModalContent = ({ entryId }: EntryModalContentProps) => {
  const getEntryQuery = entriesRetrieveOptions({
    path: {
      entry_id: Number(entryId),
    },
    client,
  });

  return (
    <DialogContent className="sm:max-w-[800px]">
      <DialogTitle className="sr-only">Правило</DialogTitle>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div className="p-8 text-lg font-bold">{error.status ?? 404}</div>
        )}
      >
        <ContentSuspenseQuery queryOptions={getEntryQuery}>
          {({ data }) => {
            const { header, text } = data.content ?? {};
            return (
              <EntryRoot>
                <EntryTitle>{header}</EntryTitle>
                <EntryContent style={{ wordBreak: 'break-word' }}>{text}</EntryContent>
              </EntryRoot>
            );
          }}
        </ContentSuspenseQuery>
      </ErrorBoundary>
    </DialogContent>
  );
};

interface SimpleModalContentProps {
  text: string;
  title?: string;
}

const SimpleModalContent = ({ text, title = 'Инфо' }: SimpleModalContentProps) => (
  <DialogContent className="flex flex-col items-center sm:max-w-lg">
    <DialogTitle className="sr-only">Контент модального окна</DialogTitle>
    <Image
      width={220}
      height={220}
      src={UrlFormatter.media('public/modal/info-modal.webp')}
      alt="girl"
      className="-mt-[90px]"
    />
    <ReText align="center" weight="semibold" size="lg">
      {title}
    </ReText>
    <ReText align="center" weight="medium" color="muted-foreground">
      {text}
    </ReText>
  </DialogContent>
);

interface ModalContentProps {
  content: ReactNode;
  title?: string;
}

const ModalContent = ({ content, title = 'Инфо' }: ModalContentProps) => (
  <DialogContent className="flex flex-col items-center sm:max-w-lg">
    <DialogTitle className="sr-only">Контент модального окна</DialogTitle>
    <Image
      width={220}
      height={220}
      src={UrlFormatter.media('public/modal/info-modal.webp')}
      alt="girl"
      className="-mt-[90px]"
    />
    <ReText align="center" weight="semibold" size="lg">
      {title}
    </ReText>
    {content}
  </DialogContent>
);

interface ModalBaseProps {
  contentProps?: DialogContentProps;
  rootProps?: DialogProps;
}

interface ModalCustomProps extends ModalBaseProps {
  content: ReactNode;
  title?: string;
  ssrOnly: string;
}

const ModalCustom = ({
  content,
  contentProps: { className, ...props } = {},
  ssrOnly = 'Контент модального окна',
  title,
}: ModalCustomProps) => (
  <DialogContent className={cn('flex flex-col items-center', className)} {...props}>
    <DialogTitle className="sr-only">{ssrOnly}</DialogTitle>
    {title && (
      <ReText align="center" weight="semibold" size="lg">
        {title}
      </ReText>
    )}
    {content}
  </DialogContent>
);
const InfoModalContent = () => {
  const { options } = useInfoModal();

  if (!options) return null;

  if (options.type === InfoModalType.ENTRY) {
    return <EntryModalContent {...options} />;
  }

  if (options.type === InfoModalType.TEXT) {
    return <SimpleModalContent {...options} />;
  }
  if (options.type === InfoModalType.CUSTOM) {
    return <ModalCustom {...options} />;
  }
  if (options.type === InfoModalType.CONTENT) {
    return <ModalContent {...options} />;
  }
  if (options.type === InfoModalType.ALERT) {
    return <AlertModalContent {...options} />;
  }

  return null;
};
export const InfoModalAction = ({
  onClick,
  children,
  ...props
}: {
  children: ReactNode;
} & ComponentProps<'div'>) => {
  const close = useInfoModal((v) => v.close);
  const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
    onClick?.(e);
    close();
  };
  return (
    <Slot {...props} onClick={handleClick}>
      {children}
    </Slot>
  );
};
export const InfoModal = () => {
  // @ts-ignore
  const { isOpen, close, options: { type } = {} } = useInfoModal();
  const Comp = type === InfoModalType.ALERT ? AlertDialog : Dialog;

  return (
    <Comp
      open={isOpen}
      onOpenChange={(value) => {
        !value && close();
      }}
    >
      <InfoModalContent />
    </Comp>
  );
};
