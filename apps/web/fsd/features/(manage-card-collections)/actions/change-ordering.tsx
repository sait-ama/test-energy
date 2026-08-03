import { Button } from '@re/ui-kit/ui/button';

import { useCanSave } from '~features/(manage-card-collections)/manage-forms/model/use-can-save';

export const ChangeOrderingButtonTrigger = () => {
  const canSave = useCanSave({ cards: false, name: false });
  return (
    <Button
      disabled={!canSave}
      variant="outline"
      className="border-secondary border border-1 border-dashed"
      color="secondary"
    >
      Изменить порядок
    </Button>
  );
};
