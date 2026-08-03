import { memo, ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { closestCorners } from '@dnd-kit/core';

import QuestionMark from '@re/ui-kit/icons/question-mark';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { cn } from '@re/ui-kit/utils/cn';

import { useChangeFavoriteHeroCards } from '~entities/inventory/model/mutations';
import { useHeroCardsByUserInfinite } from '~entities/inventory/model/queries';
import { HeroCardItem } from '~entities/inventory/ui/item/hero-card-item';
import { InfoModalTrigger } from '~features/info-modal';
import { MAX_FAVORITE_CARDS } from '~pages/(user)/inventory-tab/model/const';
import {
  useHeroCardsActionStore,
  useHeroCardsFiltersStore,
} from '~pages/(user)/inventory-tab/store/hero-cards-store';
import { useFavoriteSelection } from '~pages/(user)/inventory-tab/store/hero-cards-store';
import { pickQueryFromHeroCardsFilters } from '~pages/(user)/inventory-tab/utils';
import { InfoModalType } from '~shared/api/models/info-modal';
import type { HeroCardItemSchema } from '~shared/api/models/inventory';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { Sortable, SortableItem } from '~shared/ui/sortable/sortable';
import { importToastAsync } from '~shared/ui/toast/toast.async';

import classes from '~shared/ui/sortable/classes.module.css';

interface HeroCardOrderingEditModalProps {
  children: (options: { count: number; max: number }) => ReactNode;
}

export const HeroCardOrderingEditModal = memo((props: HeroCardOrderingEditModalProps) => {
  const { children } = props;
  const session = useSession();
  const params = useParams<{ id: string }>();

  const { setState } = useHeroCardsActionStore();
  const { filters } = useHeroCardsFiltersStore();
  const query = pickQueryFromHeroCardsFilters(filters);

  const { data } = useHeroCardsByUserInfinite({
    variables: {
      params: { userId: params.id },
      query: { ordering: query.ordering || 'rank', ...query },
    },
  });

  const { data: cards } = useHeroCardsByUserInfinite(
    {
      variables: { params: { userId: String(session?.id) }, query: { is_favorite: 1 } },
    },
    { enabled: !!session?.id }
  );

  const favoriteCards = useMemo(
    () => cards.pages?.flatMap((it) => it.results).map((it) => it.card),
    [cards]
  );
  const heroCards = useMemo(
    () => data.pages?.flatMap((it) => it.results).map((it) => it.card),
    [data]
  );

  const { mutateAsync } = useChangeFavoriteHeroCards();

  const { selection, changeAll, unselect, getItems, setData, setDataFragments } =
    useFavoriteSelection();

  useEffect(() => {
    setData(heroCards);
  }, [heroCards]);

  useEffect(() => {
    setDataFragments([favoriteCards]);
    changeAll(favoriteCards.map((it) => it.id));
  }, [favoriteCards]);

  const handleCancel = () => {
    setState((prev) => ({ ...prev, isEditFavorite: false }));
  };

  const handleChange = async () => {
    const toast = await importToastAsync();

    try {
      const value = getItems<HeroCardItemSchema>(selection.ids).map((value) => value.id);
      const data = { value: value, prevValue: favoriteCards.map((v) => v.id) };

      await mutateAsync(data);

      setState((prev) => ({ ...prev, isEditFavorite: false }));
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Ошибка добавления избранных карточек');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children({ count: selection.ids.length, max: MAX_FAVORITE_CARDS })}
      </DialogTrigger>
      <DialogContent className="cs-modal-favourite sm:max-w-lg md:max-w-[800px] lg:max-w-[1000px]">
        <div className="flex items-center gap-2">
          <DialogTitle>Изменить порядок</DialogTitle>
          <InfoModalTrigger
            asChild
            options={{
              type: InfoModalType.TEXT,
              text: 'Вы можете выбрать избранные карточки и их порядок отображения в профиле',
            }}
          >
            <Button color="secondary" circle size="xs" className="text-muted-foreground">
              <QuestionMark size={16} />
            </Button>
          </InfoModalTrigger>
        </div>
        <EmptyView isEmpty={!selection.ids.length} height="40vh">
          <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5')}>
            <Sortable
              orientation="mixed"
              collisionDetection={closestCorners}
              overlay={<div className="bg-primary/10 size-full rounded-md" />}
              value={selection.ids.map((id) => ({ id }))}
              onValueChange={(v) => {
                changeAll(v.map((v) => v.id));
              }}
            >
              {getItems<HeroCardItemSchema>(selection.ids).map((item, index) => (
                <SortableItem key={item.id} value={item.id} asTrigger>
                  <div className={index % 2 ? classes.odd : classes.even}>
                    <HeroCardItem
                      onClose={() => {
                        unselect(item.id);
                      }}
                      card={item}
                    />
                  </div>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        </EmptyView>
        <div className="mt-4 flex justify-end gap-4">
          <Button color="secondary" onClick={handleCancel}>
            Отменить
          </Button>
          <Button onClick={handleChange}>Применить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});
