import { memo, ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { captureException } from '@sentry/nextjs';

import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';

import { useChangeExchangeableHeroCards } from '~entities/inventory/model/mutations';
import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import { HeroCardItem } from '~entities/inventory/ui/item/hero-card-item';
import { InfoModalTrigger } from '~features/info-modal';
import { MAX_EXCHANGEABLE_CARDS } from '~pages/(user)/inventory-tab/model/const';
import {
  useExchangeableSelection,
  useHeroCardsActionStore,
  useHeroCardsFiltersStore,
} from '~pages/(user)/inventory-tab/store/hero-cards-store';
import { InfoModalType } from '~shared/api/models/info-modal';
import type {
  HeroCardItemSchema,
  InventoryHeroCardChangeExchangeableRequestSchema,
} from '~shared/api/models/inventory';
import { EmptyView } from '~shared/ui/empty-view';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import { pickQueryFromHeroCardsFilters } from '../utils';

interface HeroCardExchangeableEditModalProps {
  children: (options: { count: number; max: number }) => ReactNode;
}

export const HeroCardExchangeableEditModal = memo((props: HeroCardExchangeableEditModalProps) => {
  const { children } = props;
  const params = useParams<{ id: string }>();
  const { setState } = useHeroCardsActionStore();

  const { mutateAsync } = useChangeExchangeableHeroCards();

  const { selection, unselect, getItems, setData } = useExchangeableSelection();

  const { filters } = useHeroCardsFiltersStore();
  const query = pickQueryFromHeroCardsFilters(filters);
  const { data } = useHeroCardsByUserInfinite({
    variables: {
      params: { userId: params.id },
      query: {
        ...query,
        ordering: query.ordering || 'rank',
      },
    },
  });

  const heroCards = useMemo(
    () => data.pages?.flatMap((it) => it.results).map((it) => it.card),
    [data]
  );

  useEffect(() => {
    setData(heroCards);
  }, [heroCards]);

  const handleCancel = () => {
    setState((prev) => ({ ...prev, isEditExchangeable: false }));
  };

  const handleChange = async (isExchangeable: boolean) => {
    const toast = await importToastAsync();

    try {
      const value = getItems<HeroCardItemSchema>(selection.ids).map((value) => value.id);
      const data: InventoryHeroCardChangeExchangeableRequestSchema = value.map((id) => ({
        card_id: id,
        is_exchangeable: isExchangeable,
      }));

      await mutateAsync(data);

      setState((prev) => ({ ...prev, isEditExchangeable: false }));
    } catch (e: unknown) {
      captureException(e);
      toast.error('Ошибка добавления избранных карточек');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children({ count: selection.ids.length, max: MAX_EXCHANGEABLE_CARDS })}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-[800px] lg:max-w-[1000px]">
        <div className="flex items-center gap-2">
          <DialogTitle>Изменить обмениваемость</DialogTitle>
          <InfoModalTrigger
            asChild
            options={{
              type: InfoModalType.TEXT,
              text: 'Вы можете изменить запретить/разрешить обмен определенных карточек',
            }}
          >
            <Button color="secondary" circle size="xs" className="text-muted-foreground">
              <QuestionMark size={16} />
            </Button>
          </InfoModalTrigger>
        </div>
        <EmptyView isEmpty={!selection.ids.length} height="40vh">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {getItems<HeroCardItemSchema>(selection.ids).map((item) => (
              <HeroCardItem
                onClose={() => {
                  unselect(item.id);
                }}
                card={item}
              />
            ))}
          </div>
        </EmptyView>
        <div className="mt-4 flex justify-end gap-4">
          <Button color="secondary" onClick={handleCancel}>
            Отменить
          </Button>
          <Button onClick={() => handleChange(true)}>Разрешить</Button>
          <Button onClick={() => handleChange(false)}>Запретить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
