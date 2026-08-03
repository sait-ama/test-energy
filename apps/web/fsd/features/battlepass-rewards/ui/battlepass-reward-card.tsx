import { ComponentType } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Activity from '@re/ui-kit/icons/activity';
import ExternalLink from '@re/ui-kit/icons/external-link';
import Lock from '@re/ui-kit/icons/lock';
import Ticket from '@re/ui-kit/icons/ticket';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { IconProps } from '@re/ui-kit/ui/icon';
import { ReText } from '@re/ui-kit/ui/text';

import { useCurrentBattlepass } from '~entities/battlepass/model/queries';
import type { BattlePassReward } from '~shared/api/models/battlepass';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { linkBaseVariants } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { useCheckAccess, useClaimReward } from '../model/mutations';

interface RewardProps {
  model: BattlePassReward;
  canClaim: boolean;
  currentLevel: number;
}

const type2iconMap: Record<number, ComponentType<IconProps>> = {
  1: Ticket,
  7: Activity,
};

export const Reward = (props: RewardProps) => {
  const { model, currentLevel, canClaim } = props;
  const { reward_type, level, reward_name, reward_settings, reward_image, version } = model;
  const { mutateAsync: claimReward } = useClaimReward();
  const { mutateAsync: checkAccess } = useCheckAccess();

  const t = useTranslations('battlepass.rewards');

  const handleClaimReward = async () => {
    const body = { level, level_version: version };

    const toast = await importToastAsync();

    try {
      await claimReward(body);
      toast.success(t('clamped-successfully'));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const { data: { content } = {} } = useCurrentBattlepass();
  const { battlepass } = content!;

  // TODO: Implement blank reward
  // const hasReward = typeof reward_type !== 'undefined';

  const expPerLevel = battlepass.battlepass.exp_per_level ?? 1000;

  const nextOfCompletedLevel = currentLevel + 1 === level;
  const needExp = (currentLevel + 1) * expPerLevel - battlepass.exp;

  const isRewardTaken = currentLevel >= level;
  const canTakeReward = battlepass.exp / expPerLevel >= level;

  const Icon = type2iconMap[reward_type!]!;

  const handleCheckAccess = async () => {
    const toast = await importToastAsync();
    try {
      await checkAccess({ version });
      toast.success(t('access-granted'));
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <Badge
        className="self-center"
        variant={version === 'free' || canClaim ? 'secondary' : 'default'}
      >
        {t('versions-type', { type: version })}
      </Badge>
      <div className="relative flex flex-col items-center justify-start">
        {reward_image ? (
          <div className="border-border relative overflow-hidden rounded-md border p-2 select-none">
            <img src={UrlFormatter.media(reward_image) as string} alt={t('reward-image')} />
          </div>
        ) : null}
        {!canClaim ? (
          <div className="bg-background/70 absolute top-0 left-0 mb-4 flex h-full w-full flex-col items-center justify-center select-none">
            <Lock className="size-16" />
            {version === 'paid' ? (
              <ReText weight="semibold" className="leading-[1.35]" align="center" size="lg">
                {t.rich('unavailable-paid', {
                  premium: (children) => (
                    <Link
                      prefetch={false}
                      target="_blank"
                      className={linkBaseVariants({
                        className: 'flex items-center gap-1',
                      })}
                      href={Routing.User.subscription()}
                    >
                      {children}
                      <ExternalLink />
                    </Link>
                  ),
                })}
              </ReText>
            ) : null}

            {version === 'free' ? (
              <ReText
                weight="semibold"
                className="max-w-36 leading-[1.35]"
                align="center"
                size="lg"
              >
                {t.rich('unavailable-free')}
              </ReText>
            ) : null}

            <Button size="sm" onClick={handleCheckAccess} className="mt-4">
              {t('check-access')}
            </Button>
          </div>
        ) : null}

        {reward_type && [1, 7].includes(reward_type) ? (
          <Badge className="absolute right-4 bottom-4 flex gap-2 px-3 py-1.5" color="secondary">
            {t('reward-amount', { amount: (reward_settings as any).count })}
            <Icon className="size-4" />
          </Badge>
        ) : null}
        <Badge className="absolute bottom-4 left-4 flex gap-2 px-3 py-1.5" color="secondary">
          {reward_name}
        </Badge>
      </div>

      <Button
        onClick={handleClaimReward}
        disabled={!canClaim || isRewardTaken || !canTakeReward}
        className="mx-2 self-center"
        variant={canTakeReward && isRewardTaken ? 'default' : 'secondary'}
      >
        {!canClaim
          ? t('cannot-claim')
          : isRewardTaken
            ? t('reward-claimed')
            : canTakeReward
              ? t('claim-reward')
              : nextOfCompletedLevel
                ? t('need-exp', { exp: needExp })
                : t('not-enough-exp')}
      </Button>
    </div>
  );
};
