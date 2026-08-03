import { useFormContext } from 'react-hook-form';

import Close from '@re/ui-kit/icons/close';
import { Button } from '@re/ui-kit/ui/button';

import type { CatalogTitleQuerySchema } from '~shared/api/models/title';

export const ClearFilters = () => {
  const { reset } = useFormContext<CatalogTitleQuerySchema>();
  return (
    <Button
      color="secondary"
      onClick={() => {
        reset();
      }}
      endIcon={<Close size={24} />}
    >
      Сбросить фильтры
    </Button>
  );
};
