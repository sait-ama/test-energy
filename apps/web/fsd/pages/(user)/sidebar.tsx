'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { Routing } from '~shared/config/routing';

const items = [
  {
    title: 'Профиль',
    tab: 'profile',
  },
  {
    title: 'Внешний вид',
    tab: 'appereance',
  },
  {
    title: 'Смена пароля',
    tab: 'password-reset',
  },
  {
    title: 'Смена почты',
    tab: 'email-change',
  },
  {
    title: 'Предпочтения',
    tab: 'preferences',
  },
  {
    title: 'Привязанные соц. сети',
    tab: 'social',
  },
  // {
  //   title: 'Перенос закладок',
  //   tab: 'external',
  // },
  {
    title: 'Уведомления',
    disabled: true,
    tab: 'notifications',
  },
  {
    className: 'border-red-500/60 text-red-500/90',
    btnVariant: 'outline',
    title: 'Деактивация',
    tab: 'deactivating',
    externalLink: Routing.User.deactivate(),
  },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const tab = pathname.split('/').at(-1)!;

  return (
    <ScrollArea className="pb-2">
      <nav className={cn('flex gap-2 lg:flex-col', className)} {...props}>
        {items.map(
          ({ btnVariant, tab: itemTab, externalLink, title, disabled = false, className }) => {
            const variant = itemTab === tab ? 'default' : 'ghost';
            const component = (
              <Button
                key={itemTab}
                variant={btnVariant ?? variant}
                className={cn('justify-start', className)}
                disabled={disabled}
              >
                {title}
              </Button>
            );

            return !disabled ? (
              <Link
                href={externalLink ?? Routing.User.settings({ params: { tab: itemTab } })}
                key={itemTab}
              >
                {component}
              </Link>
            ) : (
              component
            );
          }
        )}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
