import { PropsWithChildren } from 'react';

export const ManageCardCollectionBottomActionsSlot = ({ children }: PropsWithChildren) => {
  return (
    <div className="bg-secondary/90 mx-auto flex max-w-[420px] items-center justify-between gap-2 overflow-hidden rounded-md px-3 py-2.5 opacity-100">
      {children}
    </div>
  );
};
