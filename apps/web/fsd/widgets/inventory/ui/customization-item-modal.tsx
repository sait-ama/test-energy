'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useSetCustomization, useUnsetCustomization } from '~entities/inventory/model/mutations';
import type { CustomizationItemType, CustomizationSchema } from '~shared/api/models/inventory';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';

const CustomizationItemModalRoot = Dialog;
const CustomizationItemModalTrigger = DialogTrigger;

export interface CustomizationItemModalContentProps {
  item: CustomizationSchema<
    | CustomizationItemType.WALLPAPER
    | CustomizationItemType.FRAME
    | CustomizationItemType.AVATAR
    | CustomizationItemType.THEME
  >;
  onSuccess?: (action: 'set' | 'unset') => void | Promise<unknown>;
  className?: string;
  isCurrentUser?: boolean;
  imageSlot: ReactNode;
}

const CustomizationItemModalContent = (props: CustomizationItemModalContentProps) => {
  const { item, onSuccess, isCurrentUser = false, imageSlot, ...rest } = props;

  const session = useSession()!;

  const { mutateAsync: setCustomization } = useSetCustomization({ userId: String(session.id) });
  const { mutateAsync: unsetCustomization } = useUnsetCustomization({ userId: String(session.id) });

  const [isPending, setIsPending] = useState(false);

  const handleSet = async () => {
    try {
      setIsPending(true);
      await setCustomization({ item: item.id });

      await onSuccess?.('set');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }

    setIsPending(false);
  };

  const handleUnset = async () => {
    try {
      setIsPending(true);
      await unsetCustomization({ item: item.id });

      await onSuccess?.('unset');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }

    setIsPending(false);
  };

  const actionHandler = item.is_using ? handleUnset : handleSet;
  const actionLabel = item.is_using ? 'Снять' : 'Надеть';

  return (
    <DialogContent {...rest} className={cn('sm:max-w-[400px]', rest.className)}>
      <DialogTitle className="sr-only">Форма предмета кастомизации</DialogTitle>

      <div className="flex flex-col items-center gap-5 px-2">
        <div className="mb-[-170px] flex w-full -translate-y-[170px] justify-center">
          {imageSlot}
        </div>
        <ReText weight="semibold" size="lg" align="center" className="break-all">
          {item.image_item?.name}
        </ReText>
        {isCurrentUser ? (
          <Button onClick={actionHandler} disabled={isPending}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </DialogContent>
  );
};

export const CustomizationItemModal = {
  Root: CustomizationItemModalRoot,
  Trigger: CustomizationItemModalTrigger,
  Content: CustomizationItemModalContent,
};
