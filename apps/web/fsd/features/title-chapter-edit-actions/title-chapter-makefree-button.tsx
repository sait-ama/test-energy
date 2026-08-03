import { useParams } from 'next/navigation';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { useTitleChapterActions } from '~entities/title/model/mutations';
import { useTitleDetail } from '~entities/title/model/queries';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface TitleChapterMakeFreeProps extends ButtonProps {
  selectedIds: string;
}

export const TitleChapterMakeFreeButton = (props: TitleChapterMakeFreeProps) => {
  const { selectedIds, ...rest } = props;

  const params = useParams();
  const { data: titlesData } = useTitleDetail({
    variables: { params: { dir: params.dir } },
  });

  const { mutateAsync } = useTitleChapterActions({
    variables: {
      query: {
        is_published: titlesData?.uploaded,
        branch_id: titlesData?.branches[0].id,
        detail: 1,
      },
    },
  });
  const handleSubmit = async () => {
    try {
      const toast = await importToastAsync();
      await mutateAsync({ method: 'make_free', chapters: selectedIds });
      toast.success('Главы успешно стали бесплатными');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Button onClick={handleSubmit} {...rest} color="secondary">
      Сделать бесплатными
    </Button>
  );
};
