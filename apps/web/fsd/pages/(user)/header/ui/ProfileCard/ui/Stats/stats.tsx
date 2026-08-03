'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import FemaleIcon from '@re/ui-kit/icons/female';
import GenderIcon from '@re/ui-kit/icons/gender';
import MaleIcon from '@re/ui-kit/icons/male';
import { cn } from '@re/ui-kit/utils/cn';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { EntityLayoutStatsItemShort, EntityLayoutStatsShortRoot } from '~shared/ui/entity-layout';

const genderIconMap = (gender: number | null | undefined) => {
  switch (gender) {
    case 1:
      return MaleIcon;
    case 2:
      return FemaleIcon;
    default:
      return GenderIcon;
  }
};

export const ProfileStats = ({ id, className }: { id?: number; className?: string }) => {
  const params = useParams<{ id: string }>();
  const userId = params?.id || String(id);
  const { data } = useUserSuspenseQuery({
    variables: { params: { userId } },
  });
  const t = useTranslations('user.stats');
  const GenderIcon = genderIconMap(data?.sex);

  return (
    <EntityLayoutStatsShortRoot className={cn('justify-start', className)}>
      <EntityLayoutStatsItemShort>{t('id', { value: data?.id ?? 0 })}</EntityLayoutStatsItemShort>
    </EntityLayoutStatsShortRoot>
  );
};
