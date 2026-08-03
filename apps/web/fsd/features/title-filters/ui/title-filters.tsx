import React, { useCallback, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Sticky from 'react-sticky-el';

import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import type { FilterSchema } from '~features/title-filters/model/const';
import { filters } from '~features/title-filters/model/const';
import {
  CheckboxDesktopFilterType,
  DateSliderDesktopFilterType,
  RadioDesktopFilterType,
  SelectDesktopFilterType,
  SliderDesktopFilterType,
} from '~features/title-filters/ui/desktop-title-filters';
import {
  SelectMobileFilterContent,
  SelectMobileFilterType,
} from '~features/title-filters/ui/mobile-title-filters';
import { useBoolean } from '~shared/hooks/use-boolean';
import { useLogged } from '~shared/lib/session/use-logged';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';
import { Transition } from '~shared/ui/transition_unstable';
import { exhaustiveCheck } from '~shared/utils/exhaustive-check';

const resolveDesktopFilter = (type: FilterSchema['type']) => {
  switch (type) {
    case 'checkbox': {
      return CheckboxDesktopFilterType;
    }
    case 'slider': {
      return SliderDesktopFilterType;
    }
    case 'date-slider': {
      return DateSliderDesktopFilterType;
    }
    case 'radio': {
      return RadioDesktopFilterType;
    }
    case 'select': {
      return SelectDesktopFilterType;
    }
    default: {
      exhaustiveCheck(type);
      return () => <div />;
    }
  }
};

const useFilters = () => {
  const logged = useLogged();
  const contentType = useContentType();

  let values = filters;

  values = values.filter((filter) => {
    if (!filter.contentType) return true;

    return filter.contentType.includes(contentType);
  });

  if (!logged) {
    values = values.filter((it) => !it.logged);
  }

  return values;
};

export const DesktopTitleFilters = () => {
  const [fixed, setFixed] = useState(false);
  const renderFilters = (filter: FilterSchema) => {
    const Component = resolveDesktopFilter(filter.type);

    return <Component data-testid="catalog-filter" key={filter.field} filter={filter} />;
  };

  const values = useFilters();

  return (
    <Sticky
      hideOnBoundaryHit={false}
      // onFixedToggle={setFixed}
      topOffset={-64}
      stickyClassName="mt-[64px]"
      boundaryElement=".sticky-container"
    >
      <ReText
        size="lg"
        weight="semibold"
        // style={{
        //   marginTop: fixed ? 'calc(var(--header-height))' : 0,
        // }}
        className="flex h-9 items-end"
      >
        <span>Фильтры</span>
      </ReText>
      <div className="bg-secondary mt-3 flex w-full flex-col rounded-md py-3">
        <ScrollArea className="px-3">
          <Accordion
            type="multiple"
            className="flex max-h-[80vh] flex-col gap-4"
            defaultValue={['default']}
          >
            <AccordionItem value="default">
              <AccordionContent
                className="flex flex-col gap-4 pt-0"
                data-testid="catalog-filters-container"
              >
                {values.filter((it) => !it.extended).map(renderFilters)}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="include"
              className="border-border rounded-md border data-[state=open]:pb-2"
            >
              <AccordionHeader>
                <AccordionTrigger className="mr-0 p-4">
                  <ReText align="left" weight="semibold">
                    Расширенная фильтрация
                  </ReText>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeader>

              <AccordionContent
                className="mt-3 flex flex-col gap-4 p-4 pt-0"
                data-testid="catalog-filters-container"
              >
                {values.filter((it) => it.extended).map(renderFilters)}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="exclude"
              className="border-border rounded-md border data-[state=open]:pb-2"
            >
              <AccordionHeader>
                <AccordionTrigger className="mb-0 p-4">
                  <ReText align="left" weight="semibold">
                    Исключения
                  </ReText>
                  <AccordionIndicator />
                </AccordionTrigger>
              </AccordionHeader>

              <AccordionContent
                className="mt-3 flex flex-col gap-4 p-4 pt-0"
                data-testid="catalog-filters-container"
              >
                {values
                  .filter((it) => it.excludable)
                  .map((it) => ({ ...it, field: `exclude_${it.key}` }))
                  .map(renderFilters)}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <ScrollBar />
        </ScrollArea>
      </div>
    </Sticky>
  );
};

const resolveMobileFilter = (type: FilterSchema['type']) => {
  switch (type) {
    case 'checkbox': {
      return CheckboxDesktopFilterType;
    }
    case 'slider': {
      return SliderDesktopFilterType;
    }
    case 'date-slider': {
      return DateSliderDesktopFilterType;
    }
    case 'radio': {
      return RadioDesktopFilterType;
    }
    case 'select': {
      return SelectMobileFilterType;
    }
    default: {
      exhaustiveCheck(type);
      return () => <div />;
    }
  }
};

const MobileTitleFiltersTrigger = (props: ButtonProps) => (
  <Button color="secondary" {...props}>
    Фильтры
  </Button>
);

export const MobileTitleFilters = () => {
  const values = useFilters();
  const [snap, setSnap] = useState<NumberIsomorphic | null>('550px');
  const { control, reset } = useFormContext();

  const [contentType, setContentType] = useState<FilterSchema | 'main'>('main');

  const [open, _, setOpen] = useBoolean(false);

  const onAnimationEnd = useCallback(() => {
    setContentType('main');
  }, []);

  const onClear = useCallback(() => {
    reset();
  }, [reset]);

  const renderFilters = (filter: FilterSchema) => {
    const Component = resolveMobileFilter(filter.type);

    const handleClick = () => {
      if (filter.type === 'select') {
        setContentType(filter);
      }
    };

    return (
      <Component
        data-testid="catalog-filter"
        key={filter.field}
        filter={filter}
        onClick={handleClick}
      />
    );
  };

  const renderMainContent = useCallback(() => {
    return (
      <div
        className={cn('mx-auto mb-16 flex w-full flex-col gap-2 px-4', {
          'overflow-y-auto': snap === 1,
          'overflow-auto': snap !== 1,
        })}
      >
        <DrawerHeader>
          <DrawerTitle className="flex h-8 items-center justify-center">Фильтры</DrawerTitle>
        </DrawerHeader>
        <Accordion type="multiple" className="flex flex-col gap-2" defaultValue={['default']}>
          <AccordionItem value="default">
            <AccordionContent
              className="flex flex-col gap-3"
              data-testid="catalog-filters-container"
            >
              {values.filter((it) => !it.extended).map(renderFilters)}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="include" className="border-border mt-2 rounded-md border">
            <AccordionHeader>
              <AccordionTrigger className="mr-0 p-4">
                <ReText align="left" weight="semibold">
                  Расширенная фильтрация
                </ReText>
                <AccordionIndicator />
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionContent
              className="mt-3 flex flex-col gap-4 p-4 pt-0"
              data-testid="catalog-filters-container"
            >
              {values.filter((it) => it.extended).map(renderFilters)}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="exclude" className="border-border rounded-md border">
            <AccordionHeader>
              <AccordionTrigger className="mb-0 p-4">
                <ReText align="left" weight="semibold">
                  Исключения
                </ReText>
                <AccordionIndicator />
              </AccordionTrigger>
            </AccordionHeader>

            <AccordionContent
              className="mt-3 flex flex-col gap-4 p-4 pt-0"
              data-testid="catalog-filters-container"
            >
              {values
                .filter((it) => it.excludable)
                .map((it) => ({ ...it, field: `exclude_${it.key}` }))
                .map(renderFilters)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="fixed right-4 bottom-4 left-4 flex flex-row gap-2">
          <Button variant="flat" className="w-full" onClick={onClear}>
            Очистить
          </Button>
          <Button className="w-full" onClick={() => setOpen(false)}>
            Применить
          </Button>
        </div>
      </div>
    );
  }, []);

  const renderFiltersContent = useCallback(
    (filter: FilterSchema) => {
      return (
        <div className="flex h-full flex-1 flex-col">
          <DrawerHeader className="flex items-center justify-between gap-4 px-6">
            <Button circle variant="flat" onClick={() => setContentType('main')}>
              <ChevronLeft size={24} />
            </Button>
            <DrawerTitle>{filter.name}</DrawerTitle>
            <span className="w-12" />
          </DrawerHeader>
          <div
            className={cn('mx-auto mb-16 flex w-full flex-col gap-2', {
              'overflow-y-auto': snap === 1,
              'overflow-auto': snap !== 1,
            })}
          >
            <SelectMobileFilterContent filter={filter} onBack={() => setContentType('main')} />
          </div>
        </div>
      );
    },
    [values]
  );

  const content = useMemo(() => {
    if (contentType === 'main') {
      return renderMainContent();
    }

    return renderFiltersContent(contentType);
  }, [contentType]);

  return (
    <Drawer snapPoints={[1]} open={open} onOpenChange={setOpen} onAnimationEnd={onAnimationEnd}>
      <DrawerTrigger asChild>
        <MobileTitleFiltersTrigger />
      </DrawerTrigger>
      <DrawerContent
        className={cn(
          'fixed right-0 bottom-0 left-0 mx-[-1px] flex h-full max-h-[95%] flex-col border-none'
        )}
        hideSwipeElement
      >
        <Transition
          name="slide"
          direction={contentType === 'main' ? -1 : 1}
          className="flex flex-col"
          slideClassName="flex flex-col"
        >
          {content}
        </Transition>
      </DrawerContent>
    </Drawer>
  );
};
