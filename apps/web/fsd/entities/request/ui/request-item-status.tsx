import { Badge } from '@re/ui-kit/ui/badge';

import { ChangeRequestStatus } from '~shared/api/models/panel';

interface RequestItemStatusProps {
  status: ChangeRequestStatus;
}

export const RequestItemStatus = (props: RequestItemStatusProps) => {
  const { status } = props;

  if (status === ChangeRequestStatus.OPEN)
    return (
      <Badge color="secondary" className="whitespace-nowrap">
        На модерации
      </Badge>
    );

  if (status === ChangeRequestStatus.ACCEPTED) return <Badge variant="success">Принято</Badge>;

  if (status === ChangeRequestStatus.REJECTED)
    return <Badge variant="destructive">Отклонено</Badge>;

  return 'Тип не определен';
};
