'use client';
import { useState } from 'react';

import Add from '@re/ui-kit/icons/add';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useConnectCardForWindowProcessQuery } from '~features/(publisher)/withdraw/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

export const PublisherConnectCardButton = (props: ButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { mutateAsync, isPending } = useConnectCardForWindowProcessQuery();
  const isLoading = loading || isPending;

  const handleClick = async () => {
    if (!isLoading) {
      setLoading(true);
      try {
        const res = await mutateAsync({});
        setLoading(false);
        window.open(res.content, '_blank');
      } catch (e) {
        await resolveErrorAsync(e);
        setLoading(false);

        logger.error(e);
      }
    }
  };

  return (
    <Button
      startIcon={<Add />}
      loading={isLoading}
      disabled={isLoading || props.disabled}
      size="sm"
      onClick={handleClick}
      {...props}
    >
      Привязать карту
    </Button>
  );
};
