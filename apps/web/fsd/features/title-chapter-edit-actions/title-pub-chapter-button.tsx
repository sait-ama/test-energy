import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useTitleChapterActions } from '~entities/title/model/mutations';
import { useActiveBranchId } from '~entities/title/model/store';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface TitlePubChapterProps extends ButtonProps {
  selectedIds: string;
}

export const TitlePubChapterButton = (props: TitlePubChapterProps) => {
  const { selectedIds, ...rest } = props;

  const { value } = useActiveBranchId();

  const { mutateAsync } = useTitleChapterActions({
    variables: { query: { is_published: 0, branch_id: value, detail: 1 } },
  });
  const handleSubmit = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ method: 'pub', chapters: selectedIds });
      toast.success('Главы успешно опубликованы');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleSubmit} {...rest} color="secondary">
      Опубликовать главы
    </Button>
  );
};
