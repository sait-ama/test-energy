'use client';

import ArrowDownIcon from '@re/ui-kit/icons/arrow-down';
import ArrowTopIcon from '@re/ui-kit/icons/arrow-top';
import CheckIcon from '@re/ui-kit/icons/check';
import { Button } from '@re/ui-kit/ui/button';

import { id2NameMap } from '~features/select-catalog-ordering/model/const';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~shared/ui/drawer';

import { SelectCatalogOrderingSharedProps } from '../model/types';

export const SelectOrderingFilterBottomSheet = (props: SelectCatalogOrderingSharedProps) => {
  const { renderButton, value, onValueChange, isReversed, onReversedChange } = props;

  return (
    <Drawer>
      <DrawerTrigger asChild>{renderButton()}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Сортировка</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-wrap gap-3 px-6 pt-4">
          {Object.entries(id2NameMap).map(([id, name]) => (
            <DrawerClose asChild key={id}>
              <Button
                fullWidth
                variant="ghost"
                onClick={() => onValueChange(id)}
                className="justify-between pr-1"
                key={id}
              >
                <span className="text-[16px] font-normal">{name} </span>
                {value === id ? (
                  <div className="bg-primary flex size-7 items-center justify-center rounded-full">
                    <CheckIcon className="size-4 text-white" />
                  </div>
                ) : (
                  <div className="size-7 rounded-full border" />
                )}
              </Button>
            </DrawerClose>
          ))}
        </div>
        <div className="flex gap-4 px-8 pt-8 pb-8">
          <DrawerClose asChild>
            <Button
              fullWidth
              variant={isReversed ? 'default' : 'flat'}
              color={isReversed ? 'default' : 'secondary'}
              onClick={() => onReversedChange(true)}
              endIcon={<ArrowTopIcon />}
            >
              По убыванию
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              fullWidth
              variant={isReversed ? 'flat' : 'default'}
              color={isReversed ? 'secondary' : 'default'}
              onClick={() => onReversedChange(false)}
              endIcon={<ArrowDownIcon />}
            >
              По возрастанию
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
