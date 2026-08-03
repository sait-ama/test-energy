'use client';

import { useTranslations } from 'next-intl';

import { RegressionPointIcon } from '@re/ui-kit/icons/regression-point';
import { Button } from '@re/ui-kit/ui/button';

import { useGuildQuery } from '~entities/guild/model/hooks';
import { GuildBreadcrumbsLd } from '~pages/guild/seo/ld';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';

import { PerkTree } from './perk-tree';

export const GuildBoostPage = () => {
  const t = useTranslations('pages.guild.profile.upgrades.content');
  const { data: club } = useGuildQuery();

  return (
    <>
      <GuildBreadcrumbsLd club={club!} />
      <Section className="dark:bg-secondary">
        <SectionTitle
          aside={
            <Button color="background" size="sm" startIcon={<RegressionPointIcon />}>
              {t('n-regression-points', { n: club?.upgrade_points ?? 0 })}
            </Button>
          }
        >
          {t('label')}
        </SectionTitle>
        <SectionContent className="flex gap-4">
          <PerkTree className="mt-2" />
        </SectionContent>
      </Section>
    </>
  );
};
