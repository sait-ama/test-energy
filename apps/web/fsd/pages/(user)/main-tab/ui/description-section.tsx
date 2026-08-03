'use client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { EntityLayoutDescription, EntityLayoutDescriptionTitle } from '~shared/ui/entity-layout';

export const DescriptionSection = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const t = useTranslations('user.pages.about');

  return (
    <EntityLayoutDescription
      className="bg-card dark:bg-card lg:col-span-2"
      title={<EntityLayoutDescriptionTitle>{t('description')}</EntityLayoutDescriptionTitle>}
    >
      {data!.description}
    </EntityLayoutDescription>
  );
};
