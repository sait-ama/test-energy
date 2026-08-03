import { Suspense } from 'react';
import dynamic from 'next/dynamic';

export const UserSnapshotPreviewModal = dynamic(
  () =>
    import('./user-snapshot-preview-modal-global').then((mod) => ({
      default: mod.UserSnapshotPreviewModalRoot,
    })),
  { ssr: false }
);

export function UserSnapshotPreviewModalAsync() {
  return (
    <Suspense fallback={null}>
      <UserSnapshotPreviewModal />
    </Suspense>
  );
}
