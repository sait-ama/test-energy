'use client';
import type { PropsWithChildren } from 'react';
import { useTranslations } from 'next-intl';

import { VerticalUserCard } from '~entities/user/ui/vertical-user-card';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { useParams } from 'next/navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { v2PublishersMembersListOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { client } from '~shared/api/client';

export const PublisherMembersListRoot = ({ children }: PropsWithChildren) => {
  const t = useTranslations('reusable.sections');
  return (
    <Section>
      <SectionTitle>{t('members')}</SectionTitle>
      <SectionContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {children}
      </SectionContent>
    </Section>
  );
};

export const PublisherMembersList = () => {
  const { dir } = useParams<{ dir: string }>();
  const { data } = useSuspenseQuery(
    v2PublishersMembersListOptions({
      client,
      path: {
        dir,
      },
    })
  );

  return (
    <PublisherMembersListRoot>
      {data.map((it) => (
        <VerticalUserCard key={it?.id} model={it?.user} className="w-full !border-none" />
      ))}
    </PublisherMembersListRoot>
  );
};
