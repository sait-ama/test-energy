'use client';

import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useTranslations } from 'use-intl';

import { Button, type ButtonProps } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { Routing } from '~shared/config/routing';

export const BackToTitleButton = ({
  children,
  className,
  ...props
}: PropsWithChildren & ButtonProps) => {
  const dir = useParams<{ dir: string }>()?.dir;
  const contentType = useContentType();
  const t = useTranslations('reusable.actions');
  return (
    <Button asChild className={cn('mb-2', className)} variant="outline" {...props}>
      <Link
        prefetch={false}
        shallow={false}
        href={Routing.Title.detail({
          params: {
            content: contentType,
            dir: dir,
            tab: Routing.Title.TitleDetailTabs.MAIN,
          },
        })}
      >
        {children || t('back')}
      </Link>
    </Button>
  );
};
