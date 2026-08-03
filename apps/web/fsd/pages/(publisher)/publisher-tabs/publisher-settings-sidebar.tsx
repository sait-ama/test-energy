'use client';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { usePublisherSettingsAbility } from '~entities/publisher/model/hooks';
import { Routing } from '~shared/config/routing';

const items = [
  {
    tab: 'profile',
  },
  {
    tab: 'members',
  },
  {
    tab: 'monetization',
  },
  {
    tab: 'documents',
  },
  {
    tab: 'social',
  },
  //todo rights
] satisfies { tab: Routing.Publisher.SettingsTab }[];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { dir } = useParams();
  const tab = pathname.split('/').at(-1)!;
  const ability = usePublisherSettingsAbility();
  const t = useTranslations('publisher.segments.settings-layout');

  return (
    <nav className={cn('flex gap-2 lg:flex-col', className)} {...props}>
      {items.map((item) => {
        const component = (
          <Button
            disabled={!ability.can('read', item.tab)}
            key={item.tab}
            variant={item.tab === tab ? 'default' : 'ghost'}
            className="justify-start"
          >
            {t(`${item.tab}.title`)}
          </Button>
        );

        return ability.can('read', item.tab) ? (
          <Link
            shallow={false}
            prefetch={false}
            key={item.tab}
            href={Routing.Publisher.settings({ params: { dir: dir as string, tab: item.tab } })}
          >
            {component}
          </Link>
        ) : (
          component
        );
      })}
    </nav>
  );
}
