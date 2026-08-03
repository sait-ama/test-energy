import { ReactElement } from 'react';
import { useWatch } from 'react-hook-form';

import Ordering from '@re/ui-kit/icons/ordering';
import SearchIcon from '@re/ui-kit/icons/search';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Slot } from '@re/ui-kit/ui/slot';
import { cn } from '@re/ui-kit/utils/cn';

import { SearchField } from '~shared/api/models/search';
import { SingleSearchField } from '~shared/lib/search/search-field';
import { FormControl, FormField, FormItem } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { exhaustiveCheck } from '~shared/utils/exhaustive-check';

import { useExchangeType, useFilters } from '../model/store';

interface LayoutProps {
  typeControls: ReactElement;
  targetControls: ReactElement;
  className?: string;
}

export interface HeroCardLayoutProps extends LayoutProps {}

const HeroCardLayout = (props: HeroCardLayoutProps) => {
  'use no memo';
  const { typeControls, targetControls, className } = props;

  const filters = useFilters();

  const rankVariants = useWatch({
    control: filters.control,
    name: 'card.rank.variants',
  });

  const orderingVariants =
    useWatch({
      control: filters.control,
      name: 'card.ordering.variants',
    }) ?? [];

  return (
    <div className={cn('', className)}>
      <Slot className="mt-5">{targetControls}</Slot>
      <div className="mt-5 flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
        <Slot>{typeControls}</Slot>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <FormField
              control={filters.control}
              name="card.search.value"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      startIcon={<SearchIcon size={20} />}
                      placeholder="Поиск по карточкам..."
                      {...field}
                      type="text"
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={filters.control}
              name="card.title.value"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <SingleSearchField
                      placeholder="Выбрать тайтл"
                      onChange={(v) => field.onChange(v)}
                      transformValue={(item) => ({
                        id: String(item.id),
                        name: item.main_name,
                      })}
                      opts={{
                        fields: [SearchField.titles],
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-3">
            <FormField
              control={filters.control}
              name="card.rank.value"
              render={({ field }) => (
                <FormItem className="w-fit">
                  <FormControl>
                    <Select
                      defaultValue="user"
                      onValueChange={(value) => {
                        field.onChange(String(value));
                      }}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выбрать" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {rankVariants?.map((value) => (
                            <SelectItem key={value.id} value={String(value.id).replace('-', '')}>
                              {/*@ts-ignore*/}
                              {value.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex">
              <FormField
                control={filters.control}
                name="card.ordering.value"
                render={({ field }) => (
                  <FormControl className="h-full">
                    <Select
                      value={field.value?.replace('-', '')}
                      onValueChange={(value) => {
                        field.onChange(field.value?.startsWith('-') ? `-${value}` : value);
                      }}
                    >
                      <Button
                        asChild
                        variant="outline"
                        className="bg-input h-full justify-between overflow-ellipsis"
                      >
                        <SelectTrigger className="h-full w-48 rounded-r-none border-r-0 outline-none focus:ring-0 focus:ring-offset-0">
                          <SelectValue className="line-clamp-1" />
                        </SelectTrigger>
                      </Button>
                      <SelectContent>
                        <SelectGroup>
                          {orderingVariants.map(({ id, name }) => (
                            <SelectItem value={id} key={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                )}
              />
              <FormField
                control={filters.control}
                name="card.ordering.value"
                render={({ field }) => (
                  <Button
                    size="lg"
                    circle
                    variant="outline"
                    className="bg-input rounded-l-none pr-0.5"
                    onClick={() => {
                      field.onChange(
                        field.value?.startsWith('-') ? field.value.slice(1) : `-${field.value}`
                      );
                    }}
                  >
                    <Ordering
                      className="transition-all data-[state=reverse]:rotate-180"
                      data-state={field.value?.startsWith('-') ? 'default' : 'reverse'}
                      size={16}
                    />
                  </Button>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface CustomizationLayoutProps extends LayoutProps {}

const CustomizationLayout = (props: CustomizationLayoutProps) => {
  const { typeControls, targetControls, className } = props;

  return (
    <div className={cn('', className)}>
      <Slot className="mt-5">{targetControls}</Slot>
      <Slot className="mt-5">{typeControls}</Slot>
    </div>
  );
};

export interface ExchangeControlsProps extends LayoutProps {}

export const ExchangeControls = (props: ExchangeControlsProps) => {
  const { type } = useExchangeType();

  switch (type) {
    case 'card':
      return <HeroCardLayout {...props} />;
    case 'avatar':
    case 'wallpaper':
    case 'frame':
      return <CustomizationLayout {...props} />;
    default:
      exhaustiveCheck(type);
      return null;
  }
};
