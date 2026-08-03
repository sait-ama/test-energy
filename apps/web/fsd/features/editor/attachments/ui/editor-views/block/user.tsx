import { useTranslations } from 'next-intl';

import { UserDetail } from '@re/api/generated/types.gen';
import CloseIcon from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';

import { HorizontalCard } from '~shared/ui/horizontal-card';

export interface UserBlockViewProps {
  model: UserDetail;
  onRemove?: () => void;
}

export const UserBlockView = ({ model, onRemove }: UserBlockViewProps) => {
  const t = useTranslations('reusable.entities.attachments');

  return (
    <HorizontalCard
      className="my-3"
      imageHeight={80}
      imageWidth={80}
      name={model.username}
      image={model.cover?.high}
      actions={
        <div className="flex items-center gap-2">
          <Button color="secondary">{t('user')}</Button>
          <Button variant="ghost" circle onClick={onRemove}>
            <CloseIcon />
          </Button>
        </div>
      }
    />
  );
};
