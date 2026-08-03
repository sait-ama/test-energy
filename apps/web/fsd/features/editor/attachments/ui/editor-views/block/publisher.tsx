import { useTranslations } from 'next-intl';

import { PublisherDetail } from '@re/api/generated/types.gen';
import CloseIcon from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';

import { HorizontalCard } from '~shared/ui/horizontal-card';

export interface PublisherBlockViewProps {
  model: PublisherDetail;
  onRemove?: () => void;
}

export const PublisherBlockView = ({ model, onRemove }: PublisherBlockViewProps) => {
  const t = useTranslations('reusable.entities.attachments');

  return (
    <HorizontalCard
      className="my-3"
      name={model.name}
      image={model.cover.high}
      actions={
        <div className="flex items-center gap-2">
          <Button color="secondary">{t('publisher')}</Button>
          <Button variant="ghost" circle onClick={onRemove}>
            <CloseIcon />
          </Button>
        </div>
      }
    />
  );
};
