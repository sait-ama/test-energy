import Trash from '@re/ui-kit/icons/trash';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useTitleChapterActions } from '~entities/title/model/mutations';
import { useActiveBranchId } from '~entities/title/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

//todo доделать, добавить ручку

interface TitlteBundleDeleteButtonProps extends ButtonProps {
  selectedIds: string;
}

export const TitleBundleDeleteButton = (props: TitlteBundleDeleteButtonProps) => {
  const { selectedIds, ...rest } = props;

  const { value } = useActiveBranchId();

  const { mutateAsync } = useTitleChapterActions({
    variables: { query: { is_published: 1, branch_id: value, detail: 1 } },
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
