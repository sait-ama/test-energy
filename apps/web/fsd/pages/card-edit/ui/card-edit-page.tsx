'use client';

import { ReText } from '@re/ui-kit/ui/text';

import { QueueStatusIndicator } from '~features/queue-status-indicator/ui/queue-status-indicator';
import { Container } from '~shared/ui/container';
import { CardEditForm } from '~widgets/card-edit-form/ui/card-edit-form';

export const CardEditPage = () => {
  return (
    <Container
      layout="slim"
      className="bg-secondary dark:bg-background justify-end gap-2 rounded-md p-3 md:m-auto"
    >
      <ReText size="lg" weight="bold" className="mb-4">
        Редактирование карты
      </ReText>
      <QueueStatusIndicator type="card_item_update">
        {({ disabled }) => <CardEditForm disabled={disabled} />}
      </QueueStatusIndicator>
    </Container>
  );
};
