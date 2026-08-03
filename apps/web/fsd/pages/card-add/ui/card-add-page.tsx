'use client';

import { ReText } from '@re/ui-kit/ui/text';

import { QueueStatusIndicator } from '~features/queue-status-indicator/ui/queue-status-indicator';
import { Container } from '~shared/ui/container';
import { CardAddFormProps, CardAddPage } from '~widgets/card-add-form/ui/card-add-form';

interface CardAddPageProps {
  defaultValues?: CardAddFormProps['defaultValues'];
  key?: string;
}

export const CardAddPageRoot = (props: CardAddPageProps) => {
  const { defaultValues, key } = props;

  return (
    <Container
      layout="slim"
      className="bg-secondary dark:bg-background justify-end gap-2 rounded-md p-3 md:m-auto"
    >
      <ReText size="lg" weight="bold" className="mb-4">
        Добавление карты
      </ReText>
      <QueueStatusIndicator type="card_item_add">
        {({ disabled }) => (
          <CardAddPage defaultValues={defaultValues} key={key} disabled={disabled} />
        )}
      </QueueStatusIndicator>
    </Container>
  );
};
