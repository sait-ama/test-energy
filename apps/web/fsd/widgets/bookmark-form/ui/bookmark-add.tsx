import { useTranslations } from 'next-intl';

import { useCreateBookmark } from '~entities/user/model/mutations';
import { BookmarkForm } from '~features/bookmark-form/ui/bookmark-form';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export interface BookmarkAddFormProps {
  onSuccess?: (...args: any) => void;
  onError?: (...args: any) => void;
}

export const BookmarkAddForm = ({ onSuccess, onError }: BookmarkAddFormProps) => {
  const { mutateAsync: createBookmark, isPending } = useCreateBookmark();
  const session = useSession();
  const t = useTranslations('pages.bookmarks.bookmarks-add');

  const handleSubmit = async (values) => {
    const toast = await importToastAsync();

    try {
      await createBookmark({ data: values, params: { userId: session?.id } });

      toast.success(t('success-message'));
      onSuccess?.();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
      onError?.();
    }
  };

  return <BookmarkForm onSubmit={handleSubmit} isPending={isPending} />;
};
