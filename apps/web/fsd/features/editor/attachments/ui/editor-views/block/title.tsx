import { useTranslations } from 'next-intl';

import { TitleDetail } from '@re/api/generated/types.gen';
import CloseIcon from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';

import { HorizontalCard } from '~shared/ui/horizontal-card';

export interface TitleBlockViewProps {
  model: TitleDetail;
  onRemove?: () => void;
}

export const TitleBlockView = ({ model, onRemove }: TitleBlockViewProps) => {
  const t = useTranslations('reusable.entities.attachments');

  return (
    <HorizontalCard
      className="my-3"
      imageHeight={120}
      imageWidth={80}
      name={model.main_name}
      image={model.cover?.high}
      actions={
        <div className="flex items-center gap-2">
          <Button color="secondary">{t('title')}</Button>
          <Button variant="ghost" circle onClick={onRemove}>
            <CloseIcon />
          </Button>
        </div>
      }
    />
  );
};
