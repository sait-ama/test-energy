'use client';
import { Error500 } from '~features/error-view/ui';

export default function () {
  return (
    <Error500
      status={500}
      text="Что-то пошло нее так"
      className="min-h-sreen mt-6 flex size-full items-center justify-center"
    />
  );
}
