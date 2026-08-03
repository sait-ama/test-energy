'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { Perk } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';

import { ClubBonusIcons } from '~entities/guild/lib/consts';
import { useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { getBonusTitle, getGuildBonuses } from '~entities/guild/model/utils';
import { v2ClubsPerksRetrieveInfiniteOptions } from '~shared/api/generated/tanstack';
import { withClientOptions } from '~shared/api/react-query';
import { Card, CardContent } from '~shared/ui/card';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { NArray } from '~shared/utils/NArray';

export default function BonusesSegment() {
  const { data: club } = useGuildSuspenseQuery();
  const { data: perksData } = useApiGenSuspenseInfiniteQuery({
    ...v2ClubsPerksRetrieveInfiniteOptions(withClientOptions({ query: { count: 50 } })),
  });

  const perks = useMemo(() => perksData.pages.flatMap((it) => it.results) as Perk[], [perksData]);

  const t = useTranslations('pages.guild.bonuses');

  const bonuses = useMemo(
    () => NArray.fromRecord2Entries<number>(getGuildBonuses(club!)),
    [club, perks]
  );

  return (
    <Section className="dark:bg-secondary">
      <SectionTitle>Бонусы</SectionTitle>
      <SectionContent className="flex gap-4">
        {bonuses.map(([key, count]) => {
          // @ts-ignore
          const Icon = ClubBonusIcons?.[key] as const;
          // @ts-ignore
          const title = getBonusTitle((key, args) => t(`${key}.header`, args), key, +count);

          return (
            <Card className="w-36 border-none p-4" key={key} variant="ghost">
              <CardContent
                withHover={false}
                className="flex flex-col items-center justify-center gap-2 p-0 pt-4"
              >
                {Icon && <Icon className="size-[43px]" />}
                <ReText align="center" size="lg" weight="semibold">
                  {/*123*/}
                  {title}
                </ReText>
                <ReText align="center" color="muted-foreground" size="xs">
                  {/*// @ts-ignore*/}
                  {t(`${key}.footer`)}
                </ReText>
              </CardContent>
            </Card>
          );
        })}
      </SectionContent>
    </Section>
  );
}

export const dynamic = 'force-dynamic';
