import { type ComponentProps } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';

import type { UserSchemaFragment } from '~shared/api/models/user';
import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { Redefine } from '~shared/types/global';

import { useUserSnapshotPreviewModalStore } from '../../model/stores';
import { UserSnapshot, UserSnapshotProps } from '../user-snapshot';

export type UserSnapshotPreviewModalContentProps = Redefine<
  UserSnapshotProps,
  { overrides?: UserSchemaFragment }
> & {
  contentProps?: ComponentProps<typeof DialogContent>;
};

export const UserSnapshotPreviewModalContent = (props: UserSnapshotPreviewModalContentProps) => {
  const { contentProps, overrides = {} } = props;
  const { model, closeModal, footer } = useUserSnapshotPreviewModalStore();

  if (!model) return null;

  return (
    <DialogContent
      className="lg:min-w-[672px]"
      onEscapeKeyDown={closeModal}
      onInteractOutside={closeModal}
      {...contentProps}
    >
      <DialogTitle className="sr-only">Превью карточки</DialogTitle>
      <UserSnapshot model={{ ...model, ...overrides }} />
      {footer}
    </DialogContent>
  );
};

export const UserSnapshotPreviewModalRoot = () => {
  const { isOpen, closeModal } = useUserSnapshotPreviewModalStore();

  useOnReroute(closeModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <UserSnapshotPreviewModalContent />
    </Dialog>
  );
};
