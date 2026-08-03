import type { UseFormReturn } from 'react-hook-form/dist/types/form';

export const haveChangesCond = (form: UseFormReturn<unknown>) =>
  Object.keys(form.formState.dirtyFields).length !== 0;
export const canSaveCond = (form: UseFormReturn<unknown>) =>
  haveChangesCond(form) && !form.formState.isLoading;
