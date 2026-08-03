import Share from '@re/ui-kit/icons/share';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';

import { CollectionSchema } from '~shared/api/models/collectionSchema';
import { Routing } from '~shared/config/routing';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface ShareButtonProps extends ButtonProps {
  collection: CollectionSchema;
}

export const ShareButton = (props: ShareButtonProps) => {
  const { collection, children, ...rest } = props;

  const onShare = async () => {
    if (!collection) return;
    const toast = await importToastAsync();

    try {
      const url = new URL(window.location.href);

      url.pathname = Routing.Collection.getByID({ params: { id: collection.id } });

      await navigator.clipboard.writeText(url.toString());
      toast.success('Ссылка скопирована');
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Не получилось скопировать значение');
    }
  };

  return (
    <Button variant="secondary" circle {...rest} onClick={onShare}>
      <Share /> {children}
    </Button>
  );
};
