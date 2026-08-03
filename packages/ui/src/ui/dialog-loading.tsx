'use client';

import Brand from '@re/ui-kit/icons/brand';
import { Portal } from '@re/ui-kit/ui/portal';

export const DialogLoading = ({ onCancel }: { onCancel?: () => void }) => (
  <Portal.Root>
    <div className="absolute inset-0">
      <div
        onClick={onCancel}
        className="animate-in fade-in-0 fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/80"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="bg-background rounded-sm p-8"
        >
          <Brand className="size-10 animate-spin" />
        </div>
      </div>
    </div>
  </Portal.Root>
);
