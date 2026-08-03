import * as React from 'react';
import { useEffect, useState } from 'react';

import { create } from 'zustand';

import { Dialog, DialogContent } from '@re/ui-kit/ui/dialog';

import { useActiveChapter } from '~entities/reader/model/hooks';
import { SearchField } from '~shared/api/models/search';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import {
  ImageEditorActionsContainer,
  ImageEditorArea,
  ImageEditorCancel,
  ImageEditorRoot,
  ImageEditorSubmit,
} from '~shared/ui/image-editor';
import { downloadFile } from '~shared/utils/download-file';

export const useCardCreator = create((set, get) => ({
  isOpen: false,
  meta: [],
  open: (meta) => {
    set((prev) => ({ ...prev, isOpen: true, meta }));
  },
}));

const CardContent = () => {
  const { data } = useActiveChapter();
  const { meta, isOpen } = useCardCreator();

  const [imgUrl, setImgUrl] = useState('');
  const { open: openSearchModal } = useSearchModal();

  const handleCrop = (imgSrc: string) => {
    openSearchModal({
      fields: [SearchField.characters],
      onClick: async (item) => {
        await handleCreateCard(imgSrc, item);
      },
    });
  };

  const handleCreateCard = async (croppedImg, character) => {
    const blob = await fetch('/bff-api/create-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rank: 'd',
        img: croppedImg,
        name: character.name,
        title: character.title.main_name,
      }),
    }).then((response) => response.blob());
    const url = URL.createObjectURL(blob);

    downloadFile(url);
  };

  const handleScreenshot = async () => {
    const links = meta.map((idx) => data?.pages[idx].map((it) => it.link)).flat();

    const blob = await fetch('/bff-api/merge-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrls: links }),
    }).then((response) => response.blob());
    const url = URL.createObjectURL(blob);
    setImgUrl(url);
  };

  useEffect(() => {
    if (isOpen) handleScreenshot();
  }, [isOpen]);

  return (
    <Dialog open={!!imgUrl}>
      <DialogContent className="sm:max-w-2xl">
        <ImageEditorRoot onImageChange={handleCrop} image={imgUrl} aspect={2 / 3}>
          <ImageEditorArea>
            {({ src, ref, onLoad }) => (
              <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
            )}
          </ImageEditorArea>
          <ImageEditorActionsContainer className="bottom-8 z-[100000] w-full justify-center gap-2">
            <ImageEditorCancel
              onClick={() => {
                setImgUrl('');
              }}
            />
            <ImageEditorSubmit
              onClick={() => {
                setImgUrl('');
              }}
            />
          </ImageEditorActionsContainer>

          <style jsx>
            {`
              .ReactCrop__crop-selection {
                background: url('/card-creator/d-rank.webp') 0% 0% / cover !important;
                animation: none !important;
                -webkit-animation: none !important;
                transform: scale(1.1) translateY(-5px) !important;
                border-radius: 2%;
              }

              .ReactCrop__drag-handle {
                display: none !important;
              }
            `}
          </style>
        </ImageEditorRoot>
      </DialogContent>
    </Dialog>
  );
};
