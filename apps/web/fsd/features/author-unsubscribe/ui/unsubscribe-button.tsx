import { useEffect } from 'react';

import { Button } from '@re/ui-kit/ui/button';

import { useUnFollowOptimisticSubscriptionMutation } from '~features/author-unsubscribe/model/mutations';
import type { SubContentType } from '~shared/api/models/user-subscriptions';
import { importToastAsync } from '~shared/ui/toast/toast.async';

const reducer = (sub_type: SubContentType, id: NumberIsomorphic, isSuccess: boolean) => {
  const prefix = isSuccess ? 'Успех:\n Подписка на ' : 'Ошибка:\n Подписка на ';
  const postfix = isSuccess ? 'отменена' : 'не отменена';
  switch (sub_type) {
    case 'author_users': {
      return `${prefix} посты юзера ${id} ${postfix}`;
    }
    case 'author_publishers': {
      return `\`${prefix} посты команды ${id} ${postfix}`;
    }
    case 'titles_publishers': {
      return `\`${prefix} тайтлы команды ${id} ${postfix}`;
    }
  }
};
export const UnSubscribeButton = ({
  subType,
  entityId,
}: {
  subType: SubContentType;
  entityId: number;
}) => {
  const { mutate, data, isError, isSuccess, error } = useUnFollowOptimisticSubscriptionMutation({
    sub_type: subType,
    id: entityId,
  });
  useEffect(() => {
    (async () => {
      const toast = await importToastAsync();

      if (isError) {
        toast.error(error.message || reducer(subType, entityId, false));
        return;
      }
      if (isSuccess) {
        if (!data.detail) {
          toast.success(reducer(subType, entityId, true));
          return;
        }
        if (data.detail) {
          if (!data.detail[subType]?.includes(String(entityId))) {
            toast.success(reducer(subType, entityId, true));
            return;
          } else {
            if (data.detail[subType].length === 1) {
              toast.error(reducer(subType, entityId, false));
              return;
            } else {
              toast.success(
                `Произошла частичная отписка, ошибка с ${data.detail[subType].toString()}`
              );
            }
          }
        }
      }
    })();
  }, [isError, isSuccess, error]);
  return (
    <Button
      size="sm"
      onClick={() => {
        mutate();
      }}
    >
      отменить
    </Button>
  );
};
