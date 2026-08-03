import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { cn } from '@re/ui-kit/utils/cn';

import { useScreenshoter } from '~entities/reader/model/store';
import {
  ImageEditorActionsContainer,
  ImageEditorArea,
  ImageEditorCancel,
  ImageEditorRoot,
  ImageEditorSubmit,
} from '~shared/ui/image-editor';

export const ReaderScreenshoter = () => {
  const { callbacks, state } = useScreenshoter((v) => v.screenshoter);
  const onStateChange = useScreenshoter((v) => v.onStateChange);

  if (state.isLoading) {
    return <DialogLoading />;
  }

  const handleImageChange = (image: string) => {
    onStateChange({ editedImageUrl: image });
  };

  return (
    <Dialog
      open={!!state.mergedImageUrl}
      onOpenChange={() => {
        onStateChange({ mergedImageUrl: '' });
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Инструмент для вырезки картинок</DialogTitle>
        <ImageEditorRoot
          onImageChange={handleImageChange}
          image={state.mergedImageUrl!}
          aspect={state.aspect!}
        >
          <ImageEditorArea>
            {({ src, ref, onLoad }) => (
              <img src={src} alt="Изображение" ref={ref} onLoad={onLoad} />
            )}
          </ImageEditorArea>
          <ImageEditorActionsContainer className="sticky bottom-[-38%] left-0 z-[100000] w-full justify-center gap-2">
            <div
              className={cn(
                'border-border bg-popover/50 flex gap-2 rounded-full border p-4'
                // backdrop-blur-xs
              )}
            >
              <ImageEditorCancel onClick={callbacks.onDeny} />
              <ImageEditorSubmit />
            </div>
          </ImageEditorActionsContainer>
          {state.style}
          {/*<style jsx global>*/}
          {/*    {`*/}
          {/*        .ReactCrop__crop-selection {*/}
          {/*            background: url('/card-creator/d-rank.webp') 0% 0% / cover !important;*/}
          {/*            animation: none !important;*/}
          {/*            -webkit-animation: none !important;*/}
          {/*            transform: scale(1.1) translateY(-5px) !important;*/}
          {/*            border-radius: 2%;*/}
          {/*        }*/}

          {/*        .ReactCrop__drag-handle {*/}
          {/*            display: none !important;*/}
          {/*        }*/}
          {/*    `}*/}
          {/*</style>*/}
        </ImageEditorRoot>
      </DialogContent>
    </Dialog>
  );
};
