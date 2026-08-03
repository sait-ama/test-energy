'use client';

import { ComponentPropsWithoutRef, ReactNode, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useMutation } from '@tanstack/react-query';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { ClubBonus, ClubDetail, Perk } from '@re/api/generated/types.gen';
import { CheckIcon } from '@re/ui-kit/icons/check';
import { RegressionPointIcon } from '@re/ui-kit/icons/regression-point';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { TabsSecondary } from '@re/ui-kit/ui/tabs-secondary';
import { ReText } from '@re/ui-kit/ui/text';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { useGuildQuery } from '~entities/guild/model/hooks';
import { client } from '~shared/api/client';
import {
  v2ClubsBuyPerkCreateMutation,
  v2ClubsPerksRetrieveInfiniteOptions,
} from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useGetConfirmation } from '~shared/lib/submit-action/use-submit-action';
import { EmptyView } from '~shared/ui/empty-view';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { cn } from '~shared/utils/cn';

const splitIntoBranches = (perks: Perk[]) => {
  const branches: Record<
    number,
    {
      bonuses: ClubBonus;
      perks: Perk[];
    }
  > = {};

  perks.forEach((perk) => {
    const currentBranch = branches[perk.bonuses.id] || { bonuses: perk.bonuses, perks: [] };
    branches[perk.bonuses.id] = {
      ...currentBranch,
      perks: [...currentBranch.perks, perk],
    };
  });

  return Object.values(branches).map((it) => ({
    ...it,
    perks: it.perks.sort((a, b) => Number(a.level) - Number(b.level)),
  }));
};

interface PerkCardActionsProps {
  perk: Perk;
  club: ClubDetail;
}

const PerkCardActions = ({ perk, club }: PerkCardActionsProps) => {
  const t = useTranslations('pages.guild.profile.upgrades.content.perk-card');

  const { mutateAsync: handleBuyPerk } = useMutation({
    ...v2ClubsBuyPerkCreateMutation({ client }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ClubKeys.clubsRetrieveQueryKey({ path: { dir: club.dir! } }),
      });
    },
  });

  const getConfirmation = useGetConfirmation();

  const buttonData = useMemo(() => {
    let content = t('card-button-text.available');
    let disabled = false;

    if ((club.regression?.level || 1) < (perk.required_regression || 1)) {
      content = t('card-button-text.level-required', { level: perk.required_regression || 1 });
      disabled = true;
    } else if (Number(club.upgrade_points) < Number(perk.cost_points)) {
      content = t('card-button-text.points-required');
      disabled = true;
    }

    return { content, disabled };
  }, [perk, club]);

  const handleClick = async () => {
    await getConfirmation({
      title: t('confirmation.label'),
      description: t('confirmation.content', { points: perk.cost_points ?? 0 }),
    });

    const toast = await importToastAsync();

    try {
      await handleBuyPerk({
        path: {
          club_dir: club.dir!,
          perk_id: perk.id,
        },
      });

      toast.success(t('messages.success'));
    } catch (e) {
      resolveErrorAsync(e);
    }
  };

  return (
    <Button
      size="sm"
      disabled={buttonData.disabled}
      onClick={handleClick}
      color={buttonData.disabled ? 'background' : 'default'}
    >
      {buttonData.content}
    </Button>
  );
};

interface PerkCardProps extends ComponentPropsWithoutRef<'div'> {
  model: Perk;
  actions?: ReactNode;
}

const PerkCard = ({ className, model, actions, ...rest }: PerkCardProps) => {
  const t = useTranslations('pages.guild.profile.upgrades.content.perk-card');

  return (
    <div
      className={cn('border-border bg-secondary flex flex-col rounded-md border p-3', className)}
      {...rest}
    >
      <div className="flex items-center gap-7">
        <ReText
          size="xs"
          className="bg-background flex h-7 items-center justify-center rounded-md px-2"
        >
          LV.{model.level ?? '?'}
        </ReText>
        <ReText weight="medium">{model.name ?? t('label')}</ReText>
      </div>
      <div className="mt-4 grid grid-cols-2">
        {model.bonuses.additional_members_count ? (
          <ReText weight="medium" size="sm">
            <span>👥&nbsp;+{model.bonuses.additional_members_count}</span>
            &nbsp;
            <span className="text-muted-foreground">{t('bonuses.additional_members_count')}</span>
          </ReText>
        ) : null}
        {model.bonuses.coins_boost ? (
          <ReText weight="medium" size="sm">
            <span>⚡&nbsp;+{model.bonuses.coins_boost}%</span>
            &nbsp;
            <span className="text-muted-foreground">{t('bonuses.coins_boost')}</span>
          </ReText>
        ) : null}
        {model.bonuses.drop_card_chance ? (
          <ReText weight="medium" size="sm">
            <span>🎴&nbsp;+{model.bonuses.drop_card_chance}%</span>
            &nbsp;
            <span className="text-muted-foreground">{t('bonuses.drop_card_chance')}</span>
          </ReText>
        ) : null}
        {model.bonuses.packs_per_week ? (
          <ReText weight="medium" size="sm">
            <span>🎁&nbsp;+{model.bonuses.packs_per_week}</span>
            &nbsp;
            <span className="text-muted-foreground">{t('bonuses.packs_per_week')}</span>
          </ReText>
        ) : null}
      </div>
      {model.description ? (
        <ReText weight="medium" color="muted-foreground" size="sm" className="mt-3 mb-auto">
          {model.description}
        </ReText>
      ) : null}
      <div className="mt-3 flex items-center justify-between">
        <ReText weight="medium" size="sm" className="flex gap-1">
          <RegressionPointIcon />
          {model.cost_points}
        </ReText>
        {actions}
      </div>
    </div>
  );
};

interface PerkTreeProps {
  className?: string;
}

export const PerkTree = ({ className }: PerkTreeProps) => {
  const { data: perksData } = useApiGenSuspenseInfiniteQuery({
    ...v2ClubsPerksRetrieveInfiniteOptions({ client, query: { count: 50 } }),
    initialPageParam: 1,
    getNextPageParam: getV2NextPageParam,
  });

  const { data: club } = useGuildQuery();

  const perks = useMemo(() => perksData.pages.flatMap((it) => it.results) as Perk[], [perksData]);
  const perksBranches = useMemo(() => splitIntoBranches(perks), [perks]);

  // They kicked me out the plane off a perkSet
  const clubPerkSet = useMemo(() => new Set(club?.perks.map((it) => it.id)), [club]);

  if (!club) return null;

  return (
    <div className={cn('relative flex w-full flex-col', className)}>
      <div>
        <TabsSecondary.Root defaultValue={String(perksBranches[0]?.bonuses.id)}>
          <ScrollArea className="pb-2">
            <TabsSecondary.List variant="default">
              {perksBranches.map((branch) => (
                <TabsSecondary.Trigger key={branch.bonuses.id} value={String(branch.bonuses.id)}>
                  {branch.bonuses.name}
                </TabsSecondary.Trigger>
              ))}
            </TabsSecondary.List>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {perksBranches.map((branch) => (
            <TabsSecondary.Content value={String(branch.bonuses.id)} key={branch.bonuses.id}>
              <EmptyView isEmpty={!branch.perks.length}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {branch.perks.map((perk, i) => {
                    const hasPerk = clubPerkSet.has(perk.id);

                    return (
                      <PerkCard
                        key={perk.id}
                        model={perk}
                        actions={
                          hasPerk ? (
                            <Button circle size="sm" color="success">
                              <CheckIcon size={24} />
                            </Button>
                          ) : (
                            <PerkCardActions perk={perk} club={club!} />
                          )
                        }
                      />
                    );
                  })}
                </div>
              </EmptyView>
            </TabsSecondary.Content>
          ))}
        </TabsSecondary.Root>
      </div>
    </div>
  );
};
