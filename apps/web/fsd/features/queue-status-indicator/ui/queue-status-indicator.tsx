import { Alert, AlertDescription, AlertTitle } from '@re/ui-kit/ui/alert';
import { useSuspenseQuery } from '@tanstack/react-query';

import { V2InventoryRequestsStatusRetrieveData } from '~shared/api/generated/models';

import { reV2InventoryRequestsStatusRetrieveOptions } from '../model/queries';

interface QueueStatusIndicatorProps {
  type: V2InventoryRequestsStatusRetrieveData['query']['type'];
  children: (config: { disabled: boolean }) => React.ReactNode;
}

export const QueueStatusIndicator = (props: QueueStatusIndicatorProps) => {
  const { type, children } = props;
  const { data } = useSuspenseQuery(
    reV2InventoryRequestsStatusRetrieveOptions({
      api: { query: { type } },
    })
  );

  if (data.status !== 'closed') return children({ disabled: false });

  return (
    <>
      {data.status === 'closed' ? (
        <Alert className="my-4" severity={data.status === 'closed' ? 'error' : 'success'}>
          <AlertTitle>Очередь {data.status === 'closed' ? 'закрыта' : 'открыта'}</AlertTitle>
          {data.closing_comment ? (
            <AlertDescription>Комментарий модерации: {data.closing_comment}</AlertDescription>
          ) : null}
        </Alert>
      ) : null}

      {children({ disabled: data.status === 'closed' })}
    </>
  );
};
