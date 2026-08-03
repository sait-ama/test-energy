import { Checkbox } from '@re/ui-kit/ui/checkbox';

import { useChapterContext } from '~features/chapter-form/model/store';
import { useSelection } from '~shared/lib/selection';

export interface SelectionCheckboxProps {
  id: string;
  disabled?: boolean;
}

export const SelectionCheckbox = ({ id, disabled = false }: SelectionCheckboxProps) => {
  const { switchSelection, isSelected } = useSelection();

  const formDisabled = useChapterContext((v) => v.constants.disabled);

  return (
    <Checkbox
      disabled={formDisabled || disabled}
      onCheckedChange={() => switchSelection(id)}
      checked={isSelected(id)}
    />
  );
};
