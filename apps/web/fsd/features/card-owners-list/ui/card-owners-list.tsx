'use client';
import { ComponentPropsWithoutRef, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { v2InventoryWishesRetrieve2Options } from '@re/api/generated/@tanstack/react-query.gen';
import ExternalLink from '@re/ui-kit/icons/external-link';
import PauseIcon from '@re/ui-kit/icons/pause';
import PlayIcon from '@re/ui-kit/icons/play';
import VolumeOffIcon from '@re/ui-kit/icons/volume-off';
import VolumeOnIcon from '@re/ui-kit/icons/volume-on';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText, textVariants } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useQuery } from '@tanstack/react-query';

import { useContentType } from '~app/providers/site-config-provider';
import { useChangeWishType, useDeleteWishType } from '~entities/inventory/model/mutations';
import {
  useHeroCardByIdSuspenseQuery,
  useWishesByCardInfiniteQuery,
} from '~entities/inventory/model/queries';
import { useHeroCardControlsStore } from '~entities/inventory/model/stores';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { LikeHeroCard } from '~entities/inventory/ui/hero-card-preview/hero-card-like';
import { CardShare } from '~entities/inventory/ui/hero-card-share';
import { useCardOwnersInfiniteByCardId } from '~entities/user/model/queries';
import { VerticalUserCard, VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import { client } from '~shared/api/client';
import { WishTypeObj } from '~shared/api/models/inventory';
import type { UserCardOwnerSchema } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { linkBaseVariants } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface WishControlsProps extends ComponentPropsWithoutRef<'div'> {}

const WishControls = (props: WishControlsProps) => {
  const { className, ...rest } = props;
  const { id } = useParams<{ id: string }>();

  const t = useTranslations('reusable.messages');

  const session = useSession();
  const { data, isLoading } = useQuery({
    ...v2InventoryWishesRetrieve2Options({
      client,
      path: {
        user_id: session!.id,
        card_id: Number(id),
      },
    }),
    enabled: !!session,
  });

  const { mutateAsync: changeWishType } = useChangeWishType();
  const { mutateAsync: deleteWishType } = useDeleteWishType();

  if (isLoading) return null;

  const currentWishType = data?.wish_type;

  const handeChange = async (wishType: number | null) => {
    const toast = await importToastAsync();
    try {
      if (wishType === null) {
        await deleteWishType({ cardId: Number(id) });
        return;
      }

      await changeWishType({ card: Number(id), wish_type: wishType });

      toast.success(t('success'));
    } catch (e) {
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className={cn('flex w-full justify-center gap-2', className)} {...rest}>
      <Button
        onClick={() =>
          handeChange(currentWishType !== WishTypeObj.WANNA_GET ? WishTypeObj.WANNA_GET : null)
        }
        color={currentWishType === WishTypeObj.WANNA_GET ? 'default' : 'background'}
        variant="default"
      >
        Хочу
      </Button>
      <Button
        onClick={() =>
          handeChange(
            currentWishType !== WishTypeObj.WANNA_GET_RID_OF ? WishTypeObj.WANNA_GET_RID_OF : null
          )
        }
        color={currentWishType === WishTypeObj.WANNA_GET_RID_OF ? 'default' : 'background'}
        variant="default"
      >
        Обменяю
      </Button>
    </div>
  );
};

interface CardTabContentProps {
  data: UserCardOwnerSchema[];
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

const CardTabContent = (props: CardTabContentProps) => {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = props;
  const FlatList: FlatListType<typeof data> = _FlatList;

  return (
    <FlatList.Root
      content={data}
      isLoading={isFetchingNextPage}
      className="bg-secondary rounded-md p-4"
    >
      <FlatList.Layout
        layout="grid"
        className="grid-cols-2 min-[400px]:grid-cols-3 min-[1024px]:grid-cols-5 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      >
        <FlatList.Content>
          {({ item, attributes }) => (
            <VerticalUserCardV2
              {...attributes}
              className="w-full justify-start !border-none"
              key={item.id}
              model={item}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={12}>
          {({ key }) => (
            <VerticalUserCard className="!w-full !border-none" model={null} isLoading key={key} />
          )}
        </FlatList.Loading>
        <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
      </FlatList.Layout>
      <FlatList.Empty text="Пусто" emoji="🎴" className="col-span-full" />
    </FlatList.Root>
  );
};

const CardPlayControlButton = () => {
  const { isAnimationEnabled, setIsAnimationEnabled } = useHeroCardControlsStore();

  return (
    <Button size="sm" circle variant="ghost" onClick={() => setIsAnimationEnabled((v) => !v)}>
      {isAnimationEnabled ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
    </Button>
  );
};
const CardSoundControlButton = () => {
  const { isSoundEnabled, setIsSoundEnabled } = useHeroCardControlsStore();

  return (
    <Button size="sm" circle variant="ghost" onClick={() => setIsSoundEnabled((v) => !v)}>
      {isSoundEnabled ? <VolumeOnIcon className="size-5" /> : <VolumeOffIcon className="size-5" />}
    </Button>
  );
};

export const CardOwnersList = () => {
  const { id } = useParams<{ id: string }>();
  const isLogged = useLogged();
  const contentType = useContentType();
  const { data: card } = useHeroCardByIdSuspenseQuery({ variables: { params: { cardId: id } } });
  const [tab, setTab] = useState<'owners' | keyof typeof WishTypeObj>('owners');

  const ownersQuery = useCardOwnersInfiniteByCardId({
    variables: { params: { cardId: Number(id) } },
  });

  const owners = useMemo(
    () => ownersQuery?.data?.pages.flatMap((it) => it.results),
    [ownersQuery.data]
  );

  const wishesQuery = useWishesByCardInfiniteQuery(
    {
      variables: {
        params: { cardId: Number(id) },
        query: { wish_type: WishTypeObj[tab as keyof typeof WishTypeObj] },
      },
    },
    { enabled: tab in WishTypeObj }
  );

  const wishes = useMemo(
    () => wishesQuery?.data?.pages?.flatMap((it) => it?.results).map((it) => it.user) ?? [],
    [wishesQuery.data]
  );

  const isAnimated = typeof card?.cover?.mid === 'string' && card.cover.mid.endsWith('.webm');
  const hasSound = card.has_audio;

  if (!card) return null;

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
      {/*todo: Sticky here*/}
      <div className="bg-secondary flex w-[360px] flex-shrink-0 flex-col gap-6 rounded-md p-3">
        <HeroCard
          card={card}
          imgSize="high"
          controlsOptions={{ rewrites: { isSoundEnabled: null } }}
        />
        <ReText align="center" size="xl" weight="semibold">
          {card.character?.name || 'Коллекционная карточка'}
        </ReText>
        {(card.description ?? '').replace(htmlRegExp, '') ? (
          <ReText
            // size="xs"
            // indent="xxs"
            align="center"
            dangerouslySetInnerHTML={{ __html: card.description ?? '' }}
          />
        ) : null}

        {card.title ? (
          <Link
            className={cn(
              linkBaseVariants({ variant: 'default' }),
              textVariants({ weight: 'medium', lineClamp: 2 }),
              'flex justify-center gap-2'
            )}
            href={Routing.Title.detail({
              params: { content: contentType, dir: card.title?.dir, tab: 'main' },
            })}
          >
            {card.title?.main_name} <ExternalLink />
          </Link>
        ) : null}
        <span className="mx-auto flex flex-wrap gap-3">
          <LikeHeroCard
            className="bg-background"
            withAbbreviated
            variant="default"
            color="background"
            initialData={card}
          />
          <CardShare variant="default" color="background" model={card} />
        </span>
        {card?.author ? (
          <Link
            prefetch={false}
            href={Routing.User.detail({
              params: {
                id: card.author.id,
                tab: 'about',
              },
            })}
            className={
              // buttonVariants({ color: 'secondary' })
              cn(
                linkBaseVariants(),
                textVariants({
                  color: 'secondary-foreground',
                  size: 'sm',
                  align: 'center',
                })
              )
            }
          >
            <span className="text-muted-foreground">Автор: </span>

            {card.author.username}
          </Link>
        ) : null}
        <div className="flex justify-between self-stretch">
          {isLogged ? <WishControls /> : <div />}
          <div />
          {isAnimated ? (
            <div className="bg-background flex items-center justify-center gap-2 rounded-md px-2">
              <CardPlayControlButton />
              {hasSound ? <CardSoundControlButton /> : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as 'owners' | keyof typeof WishTypeObj)}
        >
          <ScrollArea>
            <TabsList>
              <TabsTrigger value="owners">Владельцы</TabsTrigger>
              <TabsTrigger value="WANNA_GET">Хотят получить</TabsTrigger>
              <TabsTrigger value="WANNA_GET_RID_OF">Готовы обменять</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="owners">
            <CardTabContent {...ownersQuery} data={owners} />
          </TabsContent>
          <TabsContent value="WANNA_GET">
            <CardTabContent {...wishesQuery} data={wishes} />
          </TabsContent>
          <TabsContent value="WANNA_GET_RID_OF">
            <CardTabContent {...wishesQuery} data={wishes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
