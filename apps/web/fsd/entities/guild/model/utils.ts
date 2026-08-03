import { ClubDetail } from '@re/api/generated/types.gen';

import { UserSchema } from '~shared/api/models/user';

export const getShortName = (name: string) => {
  const parts = name.split(' ').filter(Boolean);

  if (parts.length === 1) {
    return parts[0];
  }

  return parts
    .map((it) => it?.[0])
    .filter((it) => String(it).toLowerCase() !== String(it).toUpperCase())
    .join('');
};

type IntFun = (key?: string, args?: Record<string, NumberIsomorphic>) => string;

export const getBonusTitle = <T = IntFun>(t: T, key: string, count: number) => {
  const typedT = t as unknown as IntFun;
  return key?.endsWith('_multiplier')
    ? !(count - 1)
      ? `-`
      : typedT(key, { percent: Math.round(count * 100 - 100) })
    : key.includes('once')
      ? typedT(key, { count: +count })
      : typedT(key);
};

export const getGuildBonuses = (guild: ClubDetail) => {
  const levelBonus = guild.level_info.bonuses;
  const regressionBonus = guild.regression?.bonuses ?? null;
  const perksBonuses = guild.perks.map((it) => it.bonuses);

  const overallBonus = {
    ...levelBonus,
    give_deck_once_week: Number(levelBonus.give_deck_once_week),
  };

  [regressionBonus, ...perksBonuses]
    .filter((v) => !!v)
    .forEach((it) => {
      overallBonus.give_deck_once_week += it.packs_per_week ?? 0;
      overallBonus.card_chance_multiplier += it.drop_card_chance
        ? +(it.drop_card_chance / 100).toFixed(2)
        : 0;
      overallBonus.coins_chance_multiplier += it.coins_boost
        ? +(it.coins_boost / 100).toFixed(2)
        : 0;
    });

  return overallBonus;
};

export const getGuildMaxMembers = (guild: ClubDetail) => {
  const levelBonus = guild.level_info?.max_members_count || 0;
  const regressionBonus = guild.regression?.bonuses.additional_members_count || 0;
  const perksBonuses =
    guild.perks
      ?.map((it) => it.bonuses.additional_members_count ?? 0)
      ?.reduce((count, it) => it + count, 0) || 0;

  return levelBonus + regressionBonus + perksBonuses;
};

interface GuildByDirRoleBySessionFnParams {
  club: Pick<ClubDetail, 'members' | 'is_creator' | 'is_admin'> | undefined | null;
  sessionId: number | undefined | null;
}

export const getGuildRoleBySession = ({ club, sessionId }: GuildByDirRoleBySessionFnParams) => {
  if (!sessionId || !club) return null;

  const members = club.members ?? [];

  return members.find((v) => v?.user?.id === sessionId)?.role ?? null;
};

export const isUserMainGuild = ({ club, session }: { club?: ClubDetail; session?: UserSchema }) => {
  if (!session || !club) return false;

  return club!.id === session.main_club?.id;
};
