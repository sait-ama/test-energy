'use client';
import { useMemo } from 'react';
import { useFormatter, useNow, useTranslations } from 'next-intl';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { ClubDetail, ClubItemRequest, Perk } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { TabsSecondary } from '@re/ui-kit/ui/tabs-secondary';
import { ReText } from '@re/ui-kit/ui/text';

import {
  clubsRequestPaginatedListKeyOptions,
  getClubsRetrieveQueryOptions,
} from '~entities/guild/api/queries';
import { useDirDepClub } from '~entities/guild/model/hooks';
import { useAvailableSegmentsRequests } from '~pages/guild/model/by-dir/hooks';
import { client } from '~shared/api/client';
import {
  v2ClubsItemsRequestsCreateMutation,
  v2ClubsItemsRequestsRetrieveInfiniteOptions,
  v2ClubsItemsRequestsUpdateMutation,
  v2ClubsPerksRetrieveInfiniteOptions,
} from '~shared/api/generated/tanstack';
import type { ClubRequestSchema } from '~shared/api/models/guild-club';
import { useQueryState } from '~shared/hooks/use-query-state-v2';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { getClientDate } from '~shared/utils/get-client-date';
import { RequestItem } from '~widgets/guild-requests/ui/request-item';

const GuildMembersRequests = () => {
  const dir = useDirDepClub();
  const FlatList: FlatListType<ClubRequestSchema[]> = _FlatList;

  const {
    data: { pages = [] } = {},
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useApiGenSuspenseInfiniteQuery({
    ...clubsRequestPaginatedListKeyOptions({
      query: { count: 20 },
      path: { dir },
    }),
    getNextPageParam: getV2NextPageParam,
    initialPageParam: 1,
  });

  const requests = useMemo(() => pages.flatMap((request) => request.results), [pages]);

  return (
    <FlatList.Root
      isLoading={isLoading}
      content={requests}
      className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
    >
      <FlatList.Content>
        {({ item, attributes }) => <RequestItem model={item} key={item.id} {...attributes} />}
      </FlatList.Content>
      <FlatList.Loading count={10}>
        {({ key }) => <Skeleton key={key} className="aspect-[4/1] h-[133px]" />}
      </FlatList.Loading>
      <FlatList.Empty className="col-span-full" />
      <FlatList.EdgeTrigger
        onTrigger={fetchNextPage}
        canTrigger={hasNextPage && !isFetchingNextPage}
      />
    </FlatList.Root>
  );
};

const statusMap = {
  pending: 'В ожидании',
  in_progress: 'В ожидании',
  completed: 'Принято',
  rejected: 'Отклонено',
} as const;

const statusColorMap = {
  pending: 'muted',
  in_progress: 'muted',
  completed: 'success',
  rejected: 'danger',
} as const;

interface GuildItemsRequestsCard {
  model: ClubItemRequest;
}

const GuildItemsRequestsCard = ({ model }: GuildItemsRequestsCard) => {
  const t = useTranslations('pages.guild.profile.requests.content.items.request-card');
  const tReusable = useTranslations('reusable');

  const formatter = useFormatter();
  const clientData = getClientDate({ serverDateString: model.created_at });
  const now = useNow();

  const dir = useDirDepClub();

  const { mutateAsync: handleSendDenyRequest } = useMutation(
    v2ClubsItemsRequestsUpdateMutation({ client })
  );

  const getConfirmation = useGetConfirmation();

  const handleDenyClick = async () => {
    await getConfirmation({
      title: t('confirmation.label'),
      description: t('confirmation.content'),
    });

    const toast = await importToastAsync();

    try {
      await handleSendDenyRequest({ path: { club_dir: dir, request_id: model.id } });

      toast.success(t('messages.success'));
    } catch (e) {
      resolveErrorAsync(e);
    }
  };

  return (
    <div className="bg-secondary border-border rounded-md border p-4">
      <div className="flex items-center justify-between">
        <ReText weight="medium">{t('label', { id: model.id })}</ReText>
        <Button color={statusColorMap[model.status || 'pending']} size="sm">
          {statusMap[model.status || 'pending']}
        </Button>
      </div>
      <ReText size="md" color="muted-foreground" weight="medium">
        {model.club_message}
      </ReText>
      <ReText size="md" color="muted-foreground" weight="medium">
        <span className="text-foreground">{t('moderator-label')}</span>&nbsp;
        {model.moderator_message}
      </ReText>
      <div className="mt-2 flex items-center gap-4">
        <ReText>{formatter.relativeTime(clientData!, now)}</ReText>
        <Button onClick={handleDenyClick} className="ml-auto" color="muted">
          {tReusable('actions.cancel')}
        </Button>
      </div>
    </div>
  );
};

const GuildItemsRequests = () => {
  const dir = useDirDepClub();

  const {
    data: requestsData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useApiGenSuspenseInfiniteQuery({
    ...v2ClubsItemsRequestsRetrieveInfiniteOptions({
      client,
      path: {
        club_dir: dir,
      },
    }),
    getNextPageParam: getV2NextPageParam,
    initialPageParam: 1,
  });

  const requests = useMemo(
    () => requestsData.pages?.flatMap((request) => request.results),
    [requestsData]
  );

  const FlatList: FlatListType<typeof requests> = _FlatList;

  return (
    <FlatList.Root
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      content={requests}
      className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
    >
      <FlatList.Content>
        {({ item, attributes }) => (
          <GuildItemsRequestsCard model={item} key={item.id} {...attributes} />
        )}
      </FlatList.Content>
      <FlatList.Loading count={10}>
        {({ key }) => <Skeleton key={key} className="aspect-[4/1] h-[133px]" />}
      </FlatList.Loading>
      <FlatList.Empty className="col-span-full" />
      <FlatList.EdgeTrigger
        onTrigger={fetchNextPage}
        canTrigger={hasNextPage && !isFetchingNextPage}
      />
    </FlatList.Root>
  );
};

const CreateItemsRequestButton = () => {
  const t = useTranslations('pages.guild.profile.requests.content');
  const tReusable = useTranslations('reusable');

  const dir = useDirDepClub();

  const { data: _club } = useSuspenseQuery(getClubsRetrieveQueryOptions({ path: { dir } }));

  const club = _club as unknown as ClubDetail; // temp solution

  const { data: perksData } = useApiGenSuspenseInfiniteQuery({
    ...v2ClubsPerksRetrieveInfiniteOptions({
      client,
      query: { count: 50 },
    }),
    initialPageParam: 1,
    getNextPageParam: getV2NextPageParam,
  });

  const { mutateAsync: handleSend, isPending } = useMutation(
    v2ClubsItemsRequestsCreateMutation({ client })
  );

  const requiredRegressionLevel = useMemo(() => {
    const perks = (perksData.pages.flatMap((it) => it.results) || []) as Perk[];

    let requiredRegressionLevel: number | null = null;

    perks.forEach((it) => {
      if (it.bonuses.can_create_deck) {
        requiredRegressionLevel = Math.min(
          it.required_regression ?? 0,
          requiredRegressionLevel ?? 9999
        );
      }
    });

    return requiredRegressionLevel ?? 0;
  }, [perksData]);

  const formProps = useMemo(() => {
    let disabled = false;
    let buttonText = t('items.create-modal.button-text.available');

    if ((club.regression?.level ?? 0) < requiredRegressionLevel) {
      disabled = true;
      buttonText = t('items.create-modal.button-text.level-required', {
        level: requiredRegressionLevel,
      });
    }

    return {
      disabled,
      buttonText,
    };
  }, [club]);

  const handleClick = async () => {
    const toast = await importToastAsync();

    try {
      await handleSend({ path: { club_dir: dir } });

      toast.success(t('items.create-modal.messages.success'));
    } catch (e) {
      resolveErrorAsync(e);
      // toast.error(t('items.create-modal.messages.error'));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="muted" size="sm" className="ml-auto">
          {tReusable('actions.submit')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">{t('items.create-modal.label')}</DialogTitle>
        <div className="flex flex-col">
          <ReText align="center" weight="semibold" size="lg">
            {t('items.create-modal.label')}
          </ReText>
          <ReText className="mt-2" align="center" weight="medium" color="muted-foreground">
            {t.rich('items.create-modal.content', {
              u: (text) => <span className="text-foreground">{text}</span>,
              level: requiredRegressionLevel,
            })}
          </ReText>
          <Input
            className="mt-3"
            placeholder={t('items.create-modal.moderator-message')}
            disabled={formProps.disabled}
          />
          <Button
            className="mt-4"
            color={formProps.disabled ? 'secondary' : 'default'}
            disabled={formProps.disabled}
            loading={isPending}
            onClick={handleClick}
          >
            {formProps.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GuildRequestsPage = () => {
  const t = useTranslations('pages.guild.profile.requests.content');
  const [tab, setTab] = useQueryState<string>({ key: 'request-tab', defaultValue: 'members' });

  const availableSegments = useAvailableSegmentsRequests();

  return (
    <TabsSecondary.Root value={tab} onValueChange={setTab}>
      <div className="flex items-center gap-2">
        <TabsSecondary.List>
          {availableSegments.map((value) => (
            <TabsSecondary.Trigger key={value} value={value}>
              {t(`${value}.label`)}
            </TabsSecondary.Trigger>
          ))}
        </TabsSecondary.List>
        {tab === 'items' ? <CreateItemsRequestButton /> : null}
      </div>
      <TabsSecondary.Content value="members">
        <GuildMembersRequests />
      </TabsSecondary.Content>
      <TabsSecondary.Content value="items">
        <GuildItemsRequests />
      </TabsSecondary.Content>
    </TabsSecondary.Root>
  );
};
