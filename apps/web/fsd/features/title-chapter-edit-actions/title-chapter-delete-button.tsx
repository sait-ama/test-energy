import { useSearchParams } from 'next/navigation';

import Trash from '@re/ui-kit/icons/trash';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useTitleChapterActions } from '~entities/title/model/mutations';
import { useActiveBranchId } from '~entities/title/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface TitleChapterDeleteButtonProps extends ButtonProps {
  selectedIds: string;
}

export const TitleChapterDeleteButton = (props: TitleChapterDeleteButtonProps) => {
  const { selectedIds, ...rest } = props;

  const searchParams = useSearchParams();
  const isPublished = searchParams.get('tab') === 'published' ? 1 : 0;

  const { value } = useActiveBranchId();

  const { mutateAsync } = useTitleChapterActions({
    variables: { query: { is_published: isPublished, branch_id: value, detail: 1 } },
  });
  const handleSubmit = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ method: 'delete', chapters: selectedIds });
      toast.success('Главы успешно удалены');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleSubmit} {...rest} variant="destructive" circle>
      <Trash />
    </Button>
  );
};
