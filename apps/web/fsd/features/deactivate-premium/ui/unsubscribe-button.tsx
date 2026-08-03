'use client';

import React from 'react';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useDeactivateSubscriptionMutation } from '~features/deactivate-premium/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const UnsubscribeButton = (props: ButtonProps) => {
  const { children, ...rest } = props;
  const { mutateAsync } = useDeactivateSubscriptionMutation();
  const getConfirmation = useGetConfirmation();
  const handleDeactivate = async () => {
    const toast = await importToastAsync();

    const confirmed = await getConfirmation({
      title: 'Вы точно хотите отменить подписку?',
      confirmVariant: 'outline',
      description:
        'По окончании действия подписки вы потеряете все преимущества и дополнительные возможности',
    });

    if (!confirmed) return;

    try {
      await mutateAsync();
      toast.success('Продление подписки успешно отменено');
    } catch (e: unknown) {
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button color="secondary" onClick={handleDeactivate} {...rest}>
      {children}
    </Button>
  );
};
