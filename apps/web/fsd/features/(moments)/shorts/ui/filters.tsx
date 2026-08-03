import { useEffect } from 'react';

import Ordering from '@re/ui-kit/icons/ordering';
import { Button } from '@re/ui-kit/ui/button';
import { Label } from '@re/ui-kit/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Switch } from '@re/ui-kit/ui/switch';
import { cn } from '@re/ui-kit/utils/cn';
import { z } from 'zod';

import { MomentListOrdering } from '~shared/api/models/inventory';
import { useLogged } from '~shared/lib/session/use-logged';
import { Form, FormControl, FormField, FormItem, useForm } from '~shared/ui/form';

import { FILTERS_ORDERING_MAP } from '../model/constants';
import { useShortsFilters } from '../model/context';

const shortsFiltersSchema = z.object({
  ordering: z.nativeEnum(MomentListOrdering),
  is_friends: z.boolean(),
});

export const ShortsFilters = () => {
  const { filters, setFilters } = useShortsFilters();
  const form = useForm({
    schema: shortsFiltersSchema,
    defaultValues: filters,
  });

  const logged = useLogged();

  useEffect(() => {
    const subscription = form.watch((values) => {
      setFilters((prev) => ({ ...prev, ...values }));
    });

    return subscription.unsubscribe;
  }, []);

  return (
    <Form {...form}>
      <div className="flex flex-col gap-4 p-4">
        <div className="space-y-4">
          <div className="flex h-10">
            <FormField
              control={form.control}
              name="ordering"
              render={({ field }) => (
                <FormControl>
                  <Select
                    value={field.value?.replace('-', '')}
                    onValueChange={(value) => {
                      field.onChange(
                        field.value?.startsWith('-') && value !== 'random' ? `-${value}` : value
                      );
                    }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      className="bg-input h-full justify-between overflow-ellipsis"
                    >
                      <SelectTrigger
                        className={cn('h-full outline-none focus:ring-0 focus:ring-offset-0', {
                          'rounded-r-none border-r-0': filters.ordering !== 'random',
                        })}
                        data-testid="catalog-ordering-value"
                      >
                        <SelectValue className="line-clamp-1" />
                      </SelectTrigger>
                    </Button>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(FILTERS_ORDERING_MAP).map(([id, name]) => (
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
            {filters.ordering !== 'random' ? (
              <FormField
                control={form.control}
                name="ordering"
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
            ) : null}
          </div>
          {logged && (
            <FormField
              control={form.control}
              name="is_friends"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-start space-y-0 space-x-2">
                  <FormControl>
                    <Switch
                      disabled={!logged}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label htmlFor="is_friends">Только от друзей</Label>
                </FormItem>
              )}
            />
          )}
        </div>

        <Button
          className="mt-2"
          onClick={() => setFilters({ ordering: MomentListOrdering.CREATED_AT })}
          variant="outline"
        >
          Сбросить фильтры
        </Button>
      </div>
    </Form>
  );
};
