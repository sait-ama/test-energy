import dynamic from 'next/dynamic';

import FaceSmile from '@re/ui-kit/icons/face-smile';

export const StickerPickerAsync = dynamic(
  () => import('./sticker-picker').then((v) => v.StickerPicker),
  {
    ssr: false,
    loading: () => <FaceSmile className="size-5 animate-pulse" />,
  }
);
