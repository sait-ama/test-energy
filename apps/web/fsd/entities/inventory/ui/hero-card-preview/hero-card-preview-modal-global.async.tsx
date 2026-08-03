import { Suspense } from 'react';
import dynamic from 'next/dynamic';

export const HeroCardPreviewModal = dynamic(
  () =>
    import('./hero-card-preview-modal-global').then((mod) => ({
      default: mod.HeroCardPreviewModalRoot,
    })),
  { ssr: false }
);

export function HeroCardPreviewModalAsync() {
  return (
    <Suspense fallback={null}>
      <HeroCardPreviewModal />
    </Suspense>
  );
}
