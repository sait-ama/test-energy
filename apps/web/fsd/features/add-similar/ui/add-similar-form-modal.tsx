import type { Dispatch, SetStateAction } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';

import type { TitleSchemaFragment } from '~shared/api/models/title';

import { AddSimilarForm } from './add-similar-form';

export interface AddSimilarFormModalProps {
  title: TitleSchemaFragment | null;
  targetTitle: TitleSchemaFragment;
  setTitle: Dispatch<SetStateAction<TitleSchemaFragment | null>>;
}

export const AddSimilarFormModal = (props: AddSimilarFormModalProps) => {
  const { title, targetTitle, setTitle } = props;

  if (!title) return null;

  return (
    <Dialog open={!!title} onOpenChange={(value) => !value && setTitle(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle>Добавить похожий тайтл</DialogTitle>
        <AddSimilarForm
          title={title}
          targetTitle={targetTitle}
          onSuccess={() => {
            setTitle(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
