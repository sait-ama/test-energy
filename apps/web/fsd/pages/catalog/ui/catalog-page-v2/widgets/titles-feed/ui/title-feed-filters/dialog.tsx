import { PropsWithChildren } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogCloseButton,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogPrimitive,
  DialogTitle,
} from '@re/ui-kit/ui/dialog';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { useTitlesFiltersState } from '../../model/context';

export const TitlesFeedDialogFilters = (props: PropsWithChildren) => {
  const { filtersOpen, setFiltersOpenUI, setFiltersOpen } = useTitlesFiltersState();

  const handleClose = (open: boolean) => {
    if (!open) {
      setFiltersOpenUI(open);
      setFiltersOpen(open);
    }
  };

  return (
    <Dialog open={filtersOpen} onOpenChange={handleClose}>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay variant="light" />
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            'bg-background fixed flex w-full flex-col border shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 duration-200',
            'sm:top-4 sm:right-4 sm:bottom-4 sm:max-w-md sm:rounded-md',
            'top-0 right-0 bottom-0'
          )}
        >
          <DialogHeader className="flex flex-row items-center justify-between border-b py-4 pr-4 pl-6">
            <DialogTitle>Фильтры</DialogTitle>
            <DialogCloseButton onClick={() => setFiltersOpen(false)} position="unset" />
          </DialogHeader>
          <ScrollArea className="h-full flex-1">
            {props.children}
            <ScrollBar />
          </ScrollArea>
          <DialogFooter className="mt-auto border-t p-6">
            <Button fullWidth onClick={() => setFiltersOpen(false)}>
              Применить
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
