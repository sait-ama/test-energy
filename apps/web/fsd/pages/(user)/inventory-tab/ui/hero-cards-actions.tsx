import { memo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Edit from '@re/ui-kit/icons/edit';
import Filters from '@re/ui-kit/icons/filters';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { RadioGroup, RadioGroupInputItem } from '@re/ui-kit/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Switch } from '@re/ui-kit/ui/switch';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import omit from 'lodash.omit';
import { z } from 'zod';

import { useCardForms } from '~entities/inventory/model/queries';
import { SingleSearchEntityProvider } from '~features/search/ui/search-field';
import { InfoModalType } from '~shared/api/models/info-modal';
import { HeroCardOrdering, HeroCardRank, WishTypeObj } from '~shared/api/models/inventory';
import { SearchField } from '~shared/api/models/search';
import { Routing } from '~shared/config/routing';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { SingleSearchField } from '~shared/lib/search/search-field';
import { useSession } from '~shared/lib/session/use-session';
import { Form, FormControl, FormField, FormItem, FormLabel, useForm } from '~shared/ui/form';
import { capitalize } from '~shared/utils/capitalize';

import { useHeroCardsActionStore, useHeroCardsFiltersStore } from '../store/hero-cards-store';

export const options: { id: HeroCardOrdering; name: string }[] = [
  { id: 'rank', name: 'По рангу' },
  { id: '-is_favorite', name: 'По избранным' },
  { id: '-id', name: 'По новизне' },
  { id: 'card__title_id', name: 'По тайтлу' },
  { id: 'card__character_id', name: 'По персонажу' },
  { id: '-stack_count', name: 'По количеству в стаке' },
];

const EditMenuButton = () => {
  const { setState } = useHeroCardsActionStore();
  const t = useTranslations('user.pages.inventory.tab-content.hero-card.actions');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="w-full md:w-auto">
        <Button color="secondary" startIcon={<Edit />}>
          {t('block-title')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => setState((prev) => ({ ...prev, isEditFavorite: true }))}>
          {t('change-favorite')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setState((prev) => ({ ...prev, isEditExchangeable: true }))}
        >
          {t('change-exchangeable')}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className={cn('cs-button flex-[1_0_auto]')} href={Routing.Upgrade.main()}>
            {t('upgrade')}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CancelEditButton = () => {
  const { setState } = useHeroCardsActionStore();
  const t = useTranslations('reusable');

  return (
    <Button
      variant="flat"
      color="danger"
      onClick={() => {
        setState({ isEditExchangeable: false, isEditFavorite: false });
      }}
      className="w-full md:w-auto"
    >
      {t('actions.cancel')}
    </Button>
  );
};

interface HeroCardsFiltersProps {
  defaultValues: z.infer<typeof HeroCardsFiltersSchema>;
  onSubmit: (values: z.infer<typeof HeroCardsFiltersSchema>) => void;
}

const HeroCardsFilters = ({ defaultValues, onSubmit }: HeroCardsFiltersProps) => {
  const t = useTranslations('user.pages.inventory.tab-content.hero-card.filters');
  const tReusable = useTranslations('reusable');

  const form = useForm({
    schema: HeroCardsFiltersSchema,
    defaultValues: defaultValues,
  });

  const { data: cardFormsData } = useCardForms();
  const cardForms = cardFormsData?.content?.ranks || [];

  const rankOptions = [{ id: 'all', name: capitalize(tReusable('all')) }, ...cardForms];

  const wishTypeOptions = [
    { id: 'all', name: capitalize(tReusable('all')) },
    { id: WishTypeObj.WANNA_GET, name: t('wants') },
    { id: WishTypeObj.WANNA_GET_RID_OF, name: t('will-change') },
  ];

  const handleSubmit = (values: z.infer<typeof HeroCardsFiltersSchema>) => onSubmit(values);

  const handleClear = () => {
    onSubmit({ ordering: '-id' });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (e) => console.error(e))}
        className="flex flex-col gap-4"
      >
        <div>
          <ReText size="sm">{t('search-by')}</ReText>

          <div className="mt-3 flex flex-wrap gap-4">
            <FormField
              name="character_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SingleSearchEntityProvider
                      defaultValue={field.value}
                      field={SearchField.characters}
                    >
                      {({ data }) => (
                        <SingleSearchField
                          placeholder={t('search-by-name', { name: 'character' })}
                          onChange={(v) => {
                            field.onChange(v);
                          }}
                          transformValue={(item) => ({
                            id: String(item.id),
                            name: item.name,
                          })}
                          defaultValue={
                            data
                              ? {
                                  id: String(data.id),
                                  name: data.name,
                                }
                              : null
                          }
                          opts={{
                            fields: [SearchField.characters],
                          }}
                        />
                      )}
                    </SingleSearchEntityProvider>
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <FormField
              name="card_id"
              render={({ field }) => (
                <FormItem className="">
                  <FormControl>
                    <SingleSearchEntityProvider
                      defaultValue={field.value}
                      field={SearchField.cards}
                    >
                      {({ data }) => (
                        <SingleSearchField
                          placeholder={t('search-by-name', { name: 'card' })}
                          onChange={(v) => field.onChange(v)}
                          transformValue={(item) => ({
                            id: String(item.id),
                            name: `${item.id}: ${item.character?.name || '--'}`,
                          })}
                          defaultValue={
                            data
                              ? {
                                  id: String(data.id),
                                  name: `${data.id}: ${data.character?.name || '--'}`,
                                }
                              : null
                          }
                          opts={{
                            fields: [SearchField.cards],
                          }}
                        />
                      )}
                    </SingleSearchEntityProvider>
                  </FormControl>
                </FormItem>
              )}
            /> */}
            {/* todo: dir instead of id filter be pls pls pls */}
            <FormField
              name="title_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SingleSearchField
                      placeholder={t('search-by-name', { name: 'title' })}
                      onChange={(v) => field.onChange(v)}
                      transformValue={(item) => ({
                        id: String(item.id),
                        name: item.main_name,
                      })}
                      defaultValue={
                        field.value
                          ? {
                              id: field.value,
                              name: `id: ${field.value}`,
                            }
                          : null
                      }
                      opts={{
                        fields: [SearchField.titles],
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('sorting')}</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={tReusable('actions.select')} />
                  </SelectTrigger>
                  <SelectContent className="flex-0 grow-0">
                    <SelectGroup>
                      {options.map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
          name="ordering"
        />
        <FormField
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('rank')}</FormLabel>
              <RadioGroup
                value={field.value ?? 'all'}
                onValueChange={(value) => {
                  field.onChange(value === 'all' ? null : value);
                }}
                className="flex w-full flex-col gap-4"
              >
                {rankOptions.map((it) => (
                  <FormItem key={it.id} className="flex items-center space-y-0 space-x-3">
                    <FormControl>
                      <RadioGroupInputItem value={it.id} />
                    </FormControl>
                    <FormLabel className="!mb-0 font-normal">{it.name}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormItem>
          )}
          name="rank"
        />

        <FormField
          name="wish_type"
          defaultValue="all"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wish-type')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? 'all'}
                  onValueChange={(value) => {
                    field.onChange(value === 'all' ? null : value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {wishTypeOptions.map((item) => (
                        <SelectItem value={String(item.id)} key={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <ReText size="sm">{t('marked')}</ReText>
          <div className="mt-2 flex flex-wrap gap-4">
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mb-0">{t('favorite')}</FormLabel>
                </FormItem>
              )}
              name="is_favorite"
            />
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mb-0">{t('exchangeable')}</FormLabel>
                </FormItem>
              )}
              name="is_exchangeable"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={form.handleSubmit(handleClear, (e) => console.error(e))}
            type="button"
            color="secondary"
          >
            {tReusable('actions.reset')}
          </Button>
          <Button type="submit">{tReusable('actions.save')}</Button>
        </div>
      </form>
    </Form>
  );
};

const HeroCardsFiltersSchema = z.object({
  ordering: z.enum([
    '-id',
    'rank',
    'card__character_id',
    '-stack_count',
    '-is_favorite',
    'card__title_id',
  ]),
  rank: z.nativeEnum(HeroCardRank).optional().nullable(),
  wish_type: z.number().or(z.string()).optional().nullable(),
  is_exchangeable: z.boolean().optional().nullable(),
  is_favorite: z.boolean().optional().nullable(),
  title_id: z.number().or(z.string()).optional().nullable(),
  character_id: z.number().or(z.string()).optional().nullable(),
  card_id: z.number().or(z.string()).optional().nullable(),
});

export const HeroCardsActions = memo(() => {
  const t = useTranslations('user.pages.inventory.tab-content.hero-card.filters');

  const { id: userId } = useParams<{ id: string }>();
  const { open: openInfoModal, close: closeInfoModal } = useInfoModal();
  const currentUser = useSession();

  const { filters, setFilters } = useHeroCardsFiltersStore();
  const { isEdit } = useHeroCardsActionStore();

  const filtersCount = Object.values(omit(filters, ['ordering'])).filter((v) => !!v?.value).length;

  const isCurrentUser = currentUser?.id == +userId;

  const handleOpenFilters = () => {
    openInfoModal({
      type: InfoModalType.CUSTOM,
      content: (
        <div className="flex w-full flex-col gap-2">
          <ReText size="lg" weight="semibold">
            {t('block-title')}
          </ReText>
          <HeroCardsFilters
            defaultValues={{
              card_id: filters.card_id.value,
              character_id: filters.card__character_id.value,
              is_exchangeable: filters.is_exchangeable.value,
              is_favorite: filters.is_favorite.value,
              ordering: filters.ordering.value || 'rank',
              rank: filters.card__rank.value,
              title_id: filters.card__title_id.value,
              wish_type: filters.wish_type.value,
            }}
            onSubmit={(values) => {
              setFilters({
                card_id: values.card_id,
                card__character_id: values.character_id,
                is_exchangeable: values.is_exchangeable,
                card__is_exchangeable: values.is_exchangeable,
                is_favorite: values.is_favorite,
                ordering: values.ordering,
                card__rank: values.rank,
                card__title_id: values.title_id,
                wish_type: values.wish_type,
              });
              closeInfoModal();
            }}
          />
        </div>
      ),
      srOnly: t('block-title'),
    });
  };

  return (
    <div className="flex justify-end gap-2">
      {isCurrentUser ? isEdit ? <CancelEditButton /> : <EditMenuButton /> : null}
      <Button
        variant="secondary"
        className="w-full md:w-auto"
        onClick={handleOpenFilters}
        startIcon={<Filters className="mr-1 size-10" />}
      >
        <span>{t('block-title')}</span>
        {filtersCount > 0 ? (
          <Badge className="absolute -top-2 -right-2 flex aspect-square size-5 items-center justify-center px-1.5">
            {filtersCount}
          </Badge>
        ) : null}
      </Button>
    </div>
  );
});
