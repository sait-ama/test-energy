import * as React from 'react';
import { useState } from 'react';

import Add from '@re/ui-kit/icons/add';
import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import ArrowRight from '@re/ui-kit/icons/arrow-right';
import Close from '@re/ui-kit/icons/close';
import { MinusIcon } from '@re/ui-kit/icons/minus';
import { PlusIcon } from '@re/ui-kit/icons/plus';
import Redo from '@re/ui-kit/icons/redo';
import Undo from '@re/ui-kit/icons/undo';
import { Button } from '@re/ui-kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@re/ui-kit/ui/dialog';
import { Label } from '@re/ui-kit/ui/label';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { HotkeyAction } from '~entities/reader/model/const';
import { useReaderSettings } from '~entities/reader/model/store';
import { ContentTypes } from '~shared/config/constants';
import { createHotkey, transformRawHotkey } from '~shared/lib/hotkey/hot-key-single';
import { Input } from '~shared/ui/input';

interface ReaderHotkey {
  id: HotkeyAction;
  name: string;
  icon: React.ReactNode;
  only?: ContentTypes;
}

const HOTKEYS: ReaderHotkey[] = [
  { id: HotkeyAction.NEXT_CHAPTER, name: 'Следующая глава', icon: <Redo className="size-4" /> },
  { id: HotkeyAction.PREV_CHAPTER, name: 'Предыдущая глава', icon: <Undo className="size-4" /> },
  {
    id: HotkeyAction.NEXT_PAGE,
    name: 'Следующая страница',
    icon: <ArrowRight className="size-4" />,
    only: ContentTypes.MANGA,
  },
  {
    id: HotkeyAction.PREV_PAGE,
    name: 'Предыдущая страница',
    icon: <ArrowLeft className="size-4" />,
    only: ContentTypes.MANGA,
  },
  {
    id: HotkeyAction.INCREASE_CONTAINER_WIDTH,
    name: 'Увеличить ширину страницы',
    icon: <PlusIcon className="size-4" />,
    only: ContentTypes.MANGA,
  },
  {
    id: HotkeyAction.DECREASE_CONTAINER_WIDTH,
    name: 'Уменьшить ширину страницы',
    icon: <MinusIcon className="size-4" />,
    only: ContentTypes.MANGA,
  },
  // { id: HotkeyAction.SCROLL_TOP, name: 'Скролл вверх', icon: <ArrowDown className="h-4 w-4" /> },
  // { id: HotkeyAction.SCROLL_BOTTOM, name: 'Скролл вниз', icon: <ArrowTop className="h-4 w-4" /> },
];

const HotkeyChip = ({ rawHotkey, onRemove }: { rawHotkey: string; onRemove: () => void }) => {
  const transformedHotkey = React.useMemo(() => transformRawHotkey(rawHotkey), [rawHotkey]);

  if (!transformedHotkey) return null;

  return (
    <kbd className="border-border flex items-center gap-1 rounded-full border py-1.5 pr-2 pl-4 font-semibold">
      {transformedHotkey.label}
      <Button circle variant="ghost" size="xs" onClick={onRemove}>
        <Close className="size-3" />
      </Button>
    </kbd>
  );
};

export const ReaderSettingsHotkeys = () => {
  const settings = useReaderSettings((v) => v.value);
  const setSettings = useReaderSettings((v) => v.onValueChange);
  const [selectedHotkey, setSelectedHotkey] = useState<ReaderHotkey | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const transformedHotkey = React.useMemo(
    () => (newKey ? transformRawHotkey(newKey) : null),
    [newKey]
  );
  const contentType = useContentType();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();

    const hotkey = createHotkey(e);

    setNewKey(hotkey);
  };

  const handleSave = () => {
    if (selectedHotkey && newKey) {
      setSettings({
        common: {
          ...settings.common,
          hotkeys: {
            ...settings.common.hotkeys,
            [selectedHotkey.id]: Array.from(
              new Set([...settings.common.hotkeys[selectedHotkey.id], newKey])
            ),
          },
        },
      });
      setSelectedHotkey(null);
      setNewKey(null);
    }
  };

  const handleRemoveKey = (hotkeyId: HotkeyAction, keyToRemove: string) => {
    setSettings({
      common: {
        ...settings.common,
        hotkeys: {
          ...settings.common.hotkeys,
          [hotkeyId]: settings.common.hotkeys[hotkeyId].filter((it) => it !== keyToRemove),
        },
      },
    });
  };

  const hotkeys = HOTKEYS.filter((hotkey) => {
    if (!hotkey.only) return true;

    return hotkey.only === contentType;
  });

  return (
    <>
      {hotkeys.map((hotkey) => (
        <div
          key={hotkey.id}
          className="not:last:mb-4 flex flex-col gap-3 rounded-md rounded-sm border border-dashed p-2"
        >
          <ReText
            weight="medium"
            size="sm"
            color="muted-foreground"
            className="flex items-center gap-2"
          >
            {hotkey.icon}
            {hotkey.name}
          </ReText>
          <div className="flex gap-2">
            {/* {settings.common.hotkeys[hotkey.id].map((key, index) => (
                            <kbd key={index} className="flex items-center gap-1 rounded-full border border-border py-1.5 pl-4 pr-2 font-semibold">
                                {transformRawHotkey(key).label}
                                <Button
                                    circle
                                    variant="ghost"
                                    size="xs"
                                    onClick={() => {
                                        handleRemoveKey(hotkey.id, key);
                                    }}
                                >
                                    <Close className="size-3" />
                                </Button>
                            </kbd>
                        ))} */}
            {settings.common.hotkeys[hotkey.id].map((rawHotkey) => (
              <HotkeyChip
                key={rawHotkey}
                rawHotkey={rawHotkey}
                onRemove={() => handleRemoveKey(hotkey.id, rawHotkey)}
              />
            ))}
            <Dialog open={!!selectedHotkey} onOpenChange={(v) => !v && setSelectedHotkey(null)}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  circle
                  onClick={() => {
                    setSelectedHotkey(hotkey);
                  }}
                >
                  <Add />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    Добавить горячую клавишу для действия &#34;
                    {selectedHotkey?.name}&#34;
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key" className="text-right">
                      Горячая клавиша(и)
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="key"
                        onKeyDown={handleKeyDown}
                        placeholder="Нажмите клавишу(и) на клавиатуре"
                        value={transformedHotkey?.label || '-'}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewKey(null);
                    }}
                  >
                    Очистить
                  </Button>
                  <Button disabled={!transformedHotkey?.mainKey} onClick={handleSave}>
                    Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ))}
    </>
  );
};
