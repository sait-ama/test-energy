import React from 'react';
import Image from 'next/image';

import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';

import { EmojiItem } from '~entities/inventory/ui/item/emoji-item';
import type { EmojiPackSchema } from '~shared/api/models/shop';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface EmojiPackProps {
  item: EmojiPackSchema;
}

export const EmojiItemWithModal = (props: EmojiPackProps) => {
  const { emojis = [], cover, name } = props.item?.emoji_pack || {};

  return (
    <Dialog>
      <DialogTrigger>
        <EmojiItem imgSrc={UrlFormatter.media(cover?.high)} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="sr-only">предмет кастомизации</DialogTitle>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={UrlFormatter.media(cover?.high)}
              draggable={false}
              width={100}
              height={100}
              className="rounded-sm select-none"
              alt="emoji-pack"
              unoptimized
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <ReText size="lg" weight="medium" color="accent-foreground">
                  {name}
                </ReText>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button circle size="sm" variant="ghost">
                      <QuestionMark />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Про эмодзи</DialogTitle>
                    </DialogHeader>
                    <DialogContent>
                      Получая эмодзи пак, у вас появляется возможность использовать кастомные
                      стикеры на форуме, в комментариях, а в будушем - в чате
                    </DialogContent>
                  </DialogContent>
                </Dialog>
              </div>
              <ReText size="sm" weight="semibold" color="muted-foreground">
                Эмодзи-пак
              </ReText>
            </div>
          </div>
          <ScrollArea>
            <div className="bg-secondary grid h-[300px] grid-cols-3 gap-6 overflow-auto rounded-xs p-6">
              {emojis.map(({ id, image }) => (
                <Image
                  quality={75}
                  width={300}
                  height={300}
                  key={id}
                  draggable={false}
                  unoptimized
                  className="select-none"
                  alt={`эмодзи к ${name}`}
                  src={UrlFormatter.media(image.high)}
                />
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
