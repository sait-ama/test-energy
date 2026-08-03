'use client';

import { useState } from 'react';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import type { SearchItem } from '~shared/api/models/search';
import { SearchField } from '~shared/api/models/search';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

import { AddSimilarFormModalAsync } from './add-similar-form-modal.async';

export type AddSimilarButtonProps = ButtonProps & {
  targetTitle: TitleSchemaFragment;
};

export const AddSimilarButton = (props: AddSimilarButtonProps) => {
  const { onClick, targetTitle, ...rest } = props;
  const { open: openSearchModal } = useSearchModal();
  const [title, setTitle] = useState<TitleSchemaFragment | null>(null);
  const checkLogged = useLoggedCheck();

  const handleClick = (e) => {
    openSearchModal({
      fields: [SearchField.titles],
      hits: false,
      history: false,
      //@ts-ignore
      onClick: (title: SearchItem<SearchField.titles>) => {
        setTitle(title);
      },
    });
    onClick?.(e);
  };
  return (
    <>
      <Button onClick={checkLogged(handleClick)} {...rest} />
      <AddSimilarFormModalAsync setTitle={setTitle} title={title} targetTitle={targetTitle} />
    </>
  );
};
