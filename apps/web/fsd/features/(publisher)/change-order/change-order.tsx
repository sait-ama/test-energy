import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { PublisherCard } from '~entities/publisher/ui/publisher-card';
import { useChangePublisherOrder } from '~entities/user/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { Sortable, SortableItem } from '~shared/ui/sortable/sortable';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import classes from '~shared/ui/sortable/classes.module.css';

export interface ChangePublisherOrderProps {
  onSuccess?: () => void;
}

export const ChangePublisherOrder = ({ onSuccess }: ChangePublisherOrderProps) => {
  const session = useSession();
  // const { data: user } = useUserQuery({ variables: { params: { userId: session?.id } } });

  const [publishers, setPublishers] = useState(session?.publishers || []);

  const { mutateAsync: changePublisherOrder } = useChangePublisherOrder();
  const [isChangePublisherPending, setIsChangePublisherPending] = useState(false);

  const handleChangeOrder = async () => {
    setIsChangePublisherPending(true);
    try {
      await changePublisherOrder({
        publisher_ids: publishers.map((publisher) => publisher.id),
        indexes: publishers.map((_, index) => index + 1),
      });

      const toast = await importToastAsync();
      toast.success('Порядок паблишеров изменен');
      onSuccess?.();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);

      setIsChangePublisherPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <Sortable
          orientation="mixed"
          overlay={<div className="bg-primary/10 size-full rounded-md" />}
          value={publishers}
          onValueChange={(v) => setPublishers(v)}
        >
          {publishers.map((model, index) => (
            <SortableItem
              key={model.id}
              value={model.id}
              asTrigger
              className={index % 2 ? classes.odd : classes.even}
            >
              <PublisherCard withBorder model={model} />
            </SortableItem>
          ))}
        </Sortable>
      </div>
      <Button onClick={handleChangeOrder} disabled={isChangePublisherPending}>
        Применить
      </Button>
    </div>
  );
};

export interface ChangePublisherOrderModalProps {
  children: ReactNode;
}

export const ChangePublisherOrderModal = (props: ChangePublisherOrderModalProps) => {
  const { children, ...rest } = props;

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} {...rest}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent {...rest} className="sm:max-w-lg">
        <DialogTitle>Изменить порядок</DialogTitle>
        <ChangePublisherOrder onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
