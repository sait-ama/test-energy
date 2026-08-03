import { useState } from 'react';

import AddIcon from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { BookmarkAddForm } from '~widgets/bookmark-form/ui/bookmark-add';

export const BookmarkAdd = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button circle color="secondary">
          <AddIcon size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Добавить закладку</DialogTitle>
        <BookmarkAddForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
