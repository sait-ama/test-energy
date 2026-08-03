'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import Admin from '@re/ui-kit/icons/admin';
import Forum from '@re/ui-kit/icons/forum';
import Panel from '@re/ui-kit/icons/panel';
import TowerRating from '@re/ui-kit/icons/tower-rating';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { levelsColors } from '~entities/guild/lib/consts';
import { useGuildQuery, useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { getGuildMaxMembers } from '~entities/guild/model/utils';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { GuildSettingsLinkButton } from '~features/(guild-manage)/ui/guild-settings-link-button';
import { BoostClubButton } from '~features/guild-donate/ui/donate-guild-button';
import { GuildActions } from '~features/guild-pass-request/ui/guild-actions';
import { ClubPassRequest } from '~features/guild-pass-request/ui/guild-pass-request';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import {
  EntityLayoutActions,
  EntityLayoutAvatarContainer,
  EntityLayoutHeader,
  EntityLayoutHeadingContainer,
  EntityLayoutStatsItemShort,
  EntityLayoutStatsShortRoot,
  EntityLayoutTitle,
  EntityLayoutTitleContainer,
  EntityLayoutWallpaper,
} from '~shared/ui/entity-layout';
import { Wallpaper, WallpaperBackground } from '~shared/ui/wallpaper';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { GuildRegressionButton } from './guild-regression';

export const GuildLevel = ({ className }: { className?: string }) => {
  const t = useTranslations('user.level');

  const { data: club } = useGuildSuspenseQuery();
  const { level_info, cur_level: currentLevel = 1, exp = 0 } = club ?? {};

  if (!level_info) return null;

  const progressProportion = Math.min(exp / level_info.max_exp, 1);

  const [{ rgb: curRgb }, { rgb: nextRgb = 'black' } = {}] = levelsColors.slice(
    currentLevel - 1,
    currentLevel + 1
  ) as [{ rgb: string; name: string }, { rgb: string; name: string } | undefined];

  return (
    <div className={cn('cs-user-level flex items-center gap-2', className)}>
      <div
        className="cs-user-level-content border-border bg-card inline-flex h-[26px] w-full items-center gap-3 rounded-full border px-2.5 py-1.5"
        style={{
          maxWidth: 480,
        }}
      >
        <ReText
          size="xs"
          color="muted-foreground"
          className="cs-user-level-title flex whitespace-nowrap"
        >
          {t('prefix', { id: currentLevel })}
          <span className="hidden md:block">
            {t.rich('name', { name: level_info.name, br: () => <>&nbsp;</> })}
          </span>
        </ReText>
        <div className="bg-muted h-[14px] w-full max-w-[240px] overflow-hidden rounded-full lg:max-w-[280px]">
          <div
            className="h-[14px] rounded-full"
            style={{
              width: `${progressProportion * 100}%`,
              backgroundImage: `linear-gradient(to right, ${curRgb}, ${nextRgb} ${(1 / progressProportion) * 100}%)`,
            }}
          />
        </div>
        <ReText size="sm" weight="medium" className="whitespace-nowrap max-sm:text-xs">
          {exp}
          {exp > level_info.max_exp ? null : `/${level_info?.max_exp}`} очков
        </ReText>
      </div>
    </div>
  );
};

export const EntityLayoutLevelLine = () => {
  const { data: club } = useGuildSuspenseQuery();
  const { level_info, cur_level: currentLevel = 1, exp = 0 } = club ?? {};

  if (!level_info) return null;

  const progressProportion = Math.min(exp / level_info.max_exp, 1);

  const [{ rgb: curRgb }, { rgb: nextRgb = 'black' } = {}] = levelsColors.slice(
    currentLevel - 1,
    currentLevel + 1
  ) as [{ rgb: string; name: string }, { rgb: string; name: string } | undefined];

  return (
    <div className="flex flex-col items-center gap-2 md:flex-row">
      <ReText size="sm" color="muted-foreground" weight="medium" className="whitespace-nowrap">
        Ур. {currentLevel}: {level_info!.name}
      </ReText>
      <div className="cs-guild-level-content border-border bg-background inline-flex h-[26px] items-center gap-3 rounded-full border px-2 py-3">
        <div className="bg-muted h-[14px] w-[140px] overflow-hidden rounded-full lg:w-[280px]">
          <div
            className="h-[14px] rounded-full"
            style={{
              width: `${progressProportion * 100}%`,
              backgroundImage: `linear-gradient(to right, ${curRgb}, ${nextRgb} ${(1 / progressProportion) * 100}%)`,
            }}
          />
        </div>
        <div className="bg-primary h-[6px] w-[12px] rounded-full" />
        <ReText size="sm" weight="medium" className="whitespace-nowrap">
          {exp}
          {exp > level_info.max_exp ? null : `/ ${level_info?.max_exp}`} очков
        </ReText>
      </div>
    </div>
  );
};

export const GuildHeader = () => {
  const t = useTranslations('pages.guild.profile.header');
  const { data: club } = useGuildQuery();

  const maxMembers = useMemo(() => (club ? getGuildMaxMembers(club) : 0), [club]);

  if (!club) return null;

  const canRegress = club.is_creator;
  const regressLevel = club.regression?.level || 0;
  const hasWallpaper = club?.wallpaper?.high;

  return (
    <div className="relative mb-4 md:mt-4">
      {hasWallpaper ? (
        <div className="mt-1 max-sm:p-2">
          <div className="dark:bg-background relative aspect-[3/2] w-full overflow-hidden rounded-md border-none bg-white p-4 pb-0 max-sm:p-2 md:max-h-[400px]">
            <EntityLayoutWallpaper>
              {({ wallpaper }) => (
                <WallpaperBackground className="z-10 h-full w-full">
                  <Wallpaper withMask={false} src={wallpaper} className="object-cover" />
                </WallpaperBackground>
              )}
            </EntityLayoutWallpaper>
          </div>
        </div>
      ) : null}

      <EntityLayoutHeader
        className={cn('relative z-10', hasWallpaper && 'mt-[-96px] max-sm:mt-[-116px]')}
      >
        <EntityLayoutAvatarContainer className="relative mx-auto self-start">
          <UserAvatar
            avatarSrc={club?.avatar?.high}
            alt={club?.name ?? 'Аватар клуба'}
            size={168}
            className="border-none"
          />
          {club.rank ? (
            <EntityLayoutStatsItemShort
              className="flex gap-1.5 font-bold"
              icon={<TowerRating className="text-yellow-500" />}
            >
              <span className="font-bold text-yellow-500">{club?.rank!}</span>
              <span>{t('place-in-top-label')}</span>
            </EntityLayoutStatsItemShort>
          ) : null}
        </EntityLayoutAvatarContainer>
        <EntityLayoutHeadingContainer
          className={cn('sm:w-full', !hasWallpaper && 'sm:justify-center')}
        >
          <EntityLayoutTitleContainer className="flex-wrap">
            <EntityLayoutTitle style={{ wordBreak: 'break-all' }} innerClassName="md:mx-0">
              {club.name}
            </EntityLayoutTitle>

            <EntityLayoutActions style={{ flex: 0 }} className="w-full">
              {!club.is_member && <ClubPassRequest />}
              {club.is_member || club.is_creator ? (
                <>
                  <BoostClubButton />
                  <GuildActions />
                  <GuildSettingsLinkButton />
                </>
              ) : null}

              <Button asChild color="secondary" size="sm" circle>
                <StaffOnlyLink
                  target="_blank"
                  href={UrlFormatter.createUrl(
                    publicEnv('ADMIN_URL'),
                    `/club/club/${club.id}/change/`
                  )}
                >
                  <Admin />
                </StaffOnlyLink>
              </Button>
              <Button asChild color="secondary" circle size="sm">
                <StaffOnlyLink
                  target="_blank"
                  href={UrlFormatter.createUrl(publicEnv('PANEL_URL'), `/clubs/${club.id}/show`)}
                >
                  <Panel />
                </StaffOnlyLink>
              </Button>
            </EntityLayoutActions>
          </EntityLayoutTitleContainer>
          <EntityLayoutStatsShortRoot>
            <EntityLayoutStatsItemShort
              className="flex gap-1.5"
              icon={<Forum className="text-muted-foreground" />}
            >
              <span className="font-normal">
                {t('members-label')}
                {String.fromCharCode(160)}
              </span>
              <span className={cn('font-bold')}>
                {club?.members_count} / {maxMembers}
              </span>
            </EntityLayoutStatsItemShort>
            {canRegress ? (
              <GuildRegressionButton size="sm">
                {t('regression-label')}&nbsp;{regressLevel}
              </GuildRegressionButton>
            ) : (
              <EntityLayoutStatsItemShort className="flex gap-1.5">
                <span className="font-normal">
                  {t('regression-label')}&nbsp;{regressLevel}
                </span>
              </EntityLayoutStatsItemShort>
            )}
          </EntityLayoutStatsShortRoot>
          {/* <div className="rounded rounded-md px-2 max-sm:mt-4 max-sm:border max-sm:p-4">
            <EntityLayoutLevelLine />
          </div> */}
          <GuildLevel />
        </EntityLayoutHeadingContainer>
      </EntityLayoutHeader>
    </div>
  );
};
