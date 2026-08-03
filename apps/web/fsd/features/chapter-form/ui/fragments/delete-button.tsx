import DeleteIcon from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useBoolean } from '~shared/hooks/use-boolean';

import { useChapterContext } from '../../model/store';

export interface DeleteButtonProps {
  disabled?: boolean;
  onDelete?: () => void;
  className?: string;
}

export const DeleteButton = ({ disabled = false, onDelete, className }: DeleteButtonProps) => {
  const { disableDeleteWarning } = useChapterContext((v) => v.variables);

  const setVariables = useChapterContext((v) => v.setVariables);

  const [open, toggle, setOpen] = useBoolean(false);
  const handleButtonClick = disableDeleteWarning ? onDelete : toggle;

  return (
    <>
      <Button
        circle
        variant="destructive"
        className={cn('', className)}
        onClick={handleButtonClick}
        disabled={disabled}
      >
        <DeleteIcon size={18} className="" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogTitle>Удалить главу?</DialogTitle>
          <div className="flex items-center justify-between">
            <div className="item-center flex gap-2">
              <Checkbox
                onCheckedChange={(v) =>
                  setVariables((prev: any) => ({
                    ...prev,
                    disableDeleteWarning: !!v,
                  }))
                }
                value={disableDeleteWarning}
              />
              <ReText component="span">Больше не показывать</ReText>
            </div>
            <Button
              className="self-end"
              variant="destructive"
              onClick={() => {
                setOpen(false);
                onDelete?.();
              }}
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
