import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';

import { useInfiniteNotificationsList } from '~entities/notification/model/queries';
import { useNotificationsStatus } from '~entities/notification/model/store';
import { NotificationCard } from '~pages/(user)/notifications/ui/notification-card';
import type { NotificationSchema } from '~shared/api/models/notifications';
import { FlatList } from '~shared/ui/flat-list-v2';

interface NotificationWithSublistProps {
  model: NotificationSchema;
}

const NotificationWithSublistContent = (props: NotificationWithSublistProps) => {
  const { model } = props;
  const { value: status } = useNotificationsStatus();

  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteNotificationsList({
    variables: {
      query: {
        status,
        title_id: model.title,
        exclude: model.id as number,
      },
    },
  });

  return (
    <FlatList.Root
      content={data?.pages?.flatMap((it) => it.content) || []}
      isLoading={isLoading}
      className="mt-2"
    >
      <FlatList.Layout className="flex flex-col gap-1">
        <FlatList.Content>
          {({ item }) => <NotificationCard key={item.id} model={item} isSubItem />}
        </FlatList.Content>
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
      </FlatList.Layout>
    </FlatList.Root>
  );
};

export const NotificationWithSublist = (props: NotificationWithSublistProps) => {
  const { model } = props;
  const [value, setValue] = useState('');

  return (
    <Accordion type="single" collapsible className="w-full" value={value} onValueChange={setValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger className="w-full">
          <NotificationCard model={model} isSublist />
        </AccordionTrigger>
        <AccordionContent>
          {value ? <NotificationWithSublistContent {...props} /> : null}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
