import type { ComponentProps, ReactNode } from 'react';

import Check from '@re/ui-kit/icons/check';
import { cn } from '@re/ui-kit/utils/cn';

import { BookmarksList } from '~entities/bookmarks/ui/bookmarks-list';
import { useSession } from '~shared/lib/session/use-session';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';

export const SelectBookmarkTypeTriggerValue = (props: ComponentProps<'span'>) => (
  <span {...props} className={cn('cursor-pointer px-4 py-2', props.className)}>
    Добавить в закладки
  </span>
);

interface SelectBookmarkTypeProps {
  children: ReactNode;
  onSelect: (typeId: number) => void;
  selectedId?: number | null;
}

export const SelectBookmarkTypeTrigger = (props: SelectBookmarkTypeProps) => {
  const { children, selectedId, onSelect } = props;
  const session = useSession()!;

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent hideSwipeElement={false}>
        <DrawerHeader>
          <DrawerTitle>Закладки</DrawerTitle>
        </DrawerHeader>
        <BookmarksList variables={{ params: { userId: session.id } }} className="p-6">
          {({ values }) =>
            values.map((it) => (
              <div
                key={it.name}
                className="flex justify-between py-1"
                onClick={() => {
                  onSelect(it.id);
                }}
                data-type-id={it.id}
              >
                {it.name}

                {selectedId === it.id && <Check />}
              </div>
            ))
          }
        </BookmarksList>
      </DrawerContent>
    </Drawer>
  );
};
