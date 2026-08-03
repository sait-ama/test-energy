'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Activity from '@re/ui-kit/icons/activity';
import Edit from '@re/ui-kit/icons/edit';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { isRoleCreator } from '~entities/guild/lib/access';
import { useDirDepClub, useGuildMemberRole, useGuildQuery } from '~entities/guild/model/hooks';
import { getGuildMaxMembers } from '~entities/guild/model/utils';
import { VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import { Routing } from '~shared/config/routing';
import { Section, SectionContent, SectionTitle } from '~shared/ui/section';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';

export default function MembersSegment() {
  const dir = useDirDepClub();
  const { data: club } = useGuildQuery();

  const { members = [], members_count = 1 } = club || {};

  const maxMembers = useMemo(() => (club ? getGuildMaxMembers(club) : 0), [club]);

  const sortedMembers = useMemo(() => {
    return members.sort((a, b) => (b.coins_spent ?? 0) - (a.coins_spent ?? 0));
  }, [members]);

  const t = useTranslations('pages.guild.members.roles');
  const role = useGuildMemberRole();
  const canEditMembers = isRoleCreator(role);

  if (!members?.length) return null;

  return (
    <Section className="dark:bg-secondary bg-secondary">
      <SectionTitle
        aside={
          <span className="flex items-center gap-4">
            <ReText size="md" color="muted-foreground">
              {members_count}/{maxMembers}
            </ReText>
            {canEditMembers && (
              <Button variant="secondary" asChild circle>
                <Link
                  prefetch={false}
                  href={Routing.Club.clubByDirSettings({
                    params: {
                      dir,
                      tab: 'members',
                    },
                  })}
                >
                  <Edit />
                </Link>
              </Button>
            )}
          </span>
        }
      >
        Состав
      </SectionTitle>
      <SectionContent className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 md:gap-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6">
        {sortedMembers.map((it, index) => (
          <VerticalUserCardV2
            className="relative w-full overflow-visible !border-none p-2"
            isLoading={false}
            key={it?.user?.id}
            model={it?.user}
            footer={
              <div className="flex items-center justify-between gap-1">
                <Badge variant="secondary" className="">
                  <Activity className="mr-1" />
                  {getAbbreviatedNumber(it?.coins_spent, 2)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex size-[22px] items-center justify-center rounded-full p-0 text-center font-bold"
                >
                  {index + 1}
                </Badge>
              </div>
            }
            subtitle={
              <div className="flex items-center">
                <ReText size="xs" color="muted-foreground">
                  {t(it?.role)}
                </ReText>
              </div>
            }
          />
        ))}
      </SectionContent>
    </Section>
  );
}
