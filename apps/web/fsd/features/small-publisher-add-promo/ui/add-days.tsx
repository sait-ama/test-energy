import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';
import { useAddDays } from '~entities/publisher/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';

export const AddDaysButton = () => {
  const { data: publisher } = useCurrentPublisher();
  const { mutateAsync } = useAddDays({ id: publisher?.content?.id! });
  const t = useTranslations('publisher.actions.add-days.do');
  if (!publisher?.content?.is_small) return null;

  const handleClick = async () => {
    try {
      await mutateAsync();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline">
      {t('linking')}
    </Button>
  );
};
