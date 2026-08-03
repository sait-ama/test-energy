import { Suspense, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { ClubDetail, Regression } from '@re/api/generated/types.gen';
import { RegressionPointIcon } from '@re/ui-kit/icons/regression-point';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import { DialogLoading } from '@re/ui-kit/ui/dialog-loading';
import { ReText } from '@re/ui-kit/ui/text';

import { ClubKeys } from '~entities/guild/api/query-keys';
import { useDirDepClub, useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { client } from '~shared/api/client';
import {
  v2ClubsRegressionCreateMutation,
  v2ClubsRegressionsListOptions,
} from '~shared/api/generated/tanstack';
import { queryClient } from '~shared/api/react-query';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

interface RegressionContentProps {
  onSuccess: () => void;
}

const RegressionContent = (props: RegressionContentProps) => {
  const { onSuccess } = props;

  const t = useTranslations('pages.guild.profile.header.regression-modal');

  const dir = useDirDepClub();
  const { data: _club } = useGuildSuspenseQuery();
  const club = _club as unknown as ClubDetail;

  const { data: _regressions } = useSuspenseQuery(v2ClubsRegressionsListOptions({ client }));
  const regressions = _regressions?.results as Regression[];

  const { mutateAsync: handleRegression } = useMutation({
    ...v2ClubsRegressionCreateMutation({ client }),
    onSuccess: async () =>
      await queryClient.invalidateQueries({
        queryKey: ClubKeys.clubsRetrieveQueryKey({ path: { dir } }),
      }),
  });

  const currentLevel = club.regression?.level ?? 0;

  const nextRegression = regressions.find((it) => it.level === currentLevel + 1);

  const handleClick = async () => {
    const toast = await importToastAsync();

    try {
      await handleRegression({ path: { club_dir: dir } });
      toast.success(t('messages.success'));
      onSuccess();
    } catch {
      toast.success(t('messages.error'));
    }
  };

  const isMaxLevel = !club.level_info.max_exp;

  if (!nextRegression)
    return (
      <ReText align="center" weight="medium" color="muted-foreground">
        {t('reached-limit-label')}
      </ReText>
    );

  return (
    <div className="flex flex-col">
      <ReText align="center" size="md" weight="medium" color="muted-foreground">
        {t('regression-label')}
      </ReText>
      <ReText align="center" weight="medium" color="muted-foreground">
        {t.rich('max-level-block.label', {
          u: (text) => <span className="text-foreground">{text}</span>,
        })}
      </ReText>
      <ReText className="mt-4" align="center" size="md" weight="medium" color="foreground">
        {t('after-regression-block.label')}
      </ReText>
      <ReText align="center" size="md" weight="medium" color="muted-foreground">
        {t.rich('after-regression-block.content', { level: currentLevel + 1, br: () => <br /> })}
      </ReText>
      <ReText className="mt-4" align="center" size="md" weight="medium" color="muted-foreground">
        {t.rich('appendix-block.content', {
          max_regressions: regressions.length,
          u: (text) => <span className="text-foreground">{text}</span>,
          br: () => <br />,
        })}
      </ReText>
      <ReText className="mt-4" align="center" size="md" weight="medium" color="foreground">
        {t('bonuses-block.label')}
      </ReText>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {nextRegression.bonuses.additional_members_count ? (
          <Button color="secondary">
            {t('bonuses-block.additional_members_count', {
              amount: nextRegression.bonuses.additional_members_count,
            })}
          </Button>
        ) : null}
        {nextRegression.bonuses.coins_boost ? (
          <Button color="secondary">
            {t('bonuses-block.coins_boost', { amount: nextRegression.bonuses.coins_boost })}
          </Button>
        ) : null}
        {nextRegression.bonuses.drop_card_chance ? (
          <Button color="secondary">
            {t('bonuses-block.drop_card_chance', {
              amount: nextRegression.bonuses.drop_card_chance,
            })}
          </Button>
        ) : null}
        {nextRegression.bonuses.packs_per_week ? (
          <Button color="secondary">
            {t('bonuses-block.packs_per_week', { amount: nextRegression.bonuses.packs_per_week })}
          </Button>
        ) : null}
        <Button color="secondary">
          <RegressionPointIcon />
          {t('bonuses-block.upgrade_points', {
            amount: nextRegression.bonuses.upgrade_points || 0,
          })}
        </Button>
      </div>

      <Button className="mt-4 self-center" onClick={handleClick} disabled={!isMaxLevel}>
        {isMaxLevel ? t('button-text.available') : t('button-text.max-level-required')}
      </Button>
    </div>
  );
};

export interface GuildRegressionButtonProps extends Omit<ButtonProps, 'onClick'> {}

export const GuildRegressionButton = ({ children, ...rest }: GuildRegressionButtonProps) => {
  const t = useTranslations('pages.guild.profile.header.regression-modal');

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...rest}>{children}</Button>
      </DialogTrigger>
      <Suspense fallback={<DialogLoading />}>
        <DialogContent className="flex flex-col items-center sm:max-w-lg">
          <DialogTitle className="sr-only">{t('modal-label')}</DialogTitle>
          <Image
            width={220}
            height={220}
            src={UrlFormatter.media('public/modal/info-modal.webp')}
            alt="girl"
            className="-mt-[90px] select-none"
            draggable={false}
          />
          <ReText align="center" weight="semibold" size="lg">
            {t('modal-label')}
          </ReText>

          <RegressionContent onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Suspense>
    </Dialog>
  );
};
