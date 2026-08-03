import Link from 'next/link';

import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';

import { useDirDepClub, useGuildMemberRole } from '~entities/guild/model/hooks';
import { Routing } from '~shared/config/routing';

export const GuildSettingsLinkButton = () => {
  const dir = useDirDepClub();
  const role = useGuildMemberRole();

  if (!role || role === 'member') return null;

  return (
    <Button asChild color="secondary" circle size="sm">
      <Link
        shallow={false}
        prefetch={false}
        href={Routing.Club.clubByDirSettings({
          params: {
            dir,
            tab: 'about',
          },
        })}
      >
        <Settings />
      </Link>
    </Button>
  );
};
