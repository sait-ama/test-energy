'use client';

import { useState } from 'react';

import ChevronDown from '@re/ui-kit/icons/chevron-down';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';

import { useUpdateCurrentUser } from '~entities/user/model/mutations';
import { useUserBadges, useUserSuspenseQuery } from '~entities/user/model/queries';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { cn } from '~shared/utils/cn';

export const BadgeEdit = ({ className }: { className?: string }) => {
  const session = useSession();
  const id = String(session!.id);

  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const { data: badgesData } = useUserBadges({
    variables: { params: { userId: id }, query: { count: 120 } },
  });

  const { tagline } = user ?? {};
  const badges = badgesData?.pages?.flatMap((it) => it.results) || [];

  const [open, setOpen] = useState(false);
  const { mutateAsync } = useUpdateCurrentUser();

  const handleChange = async (tagline: string | null) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ tagline });
      toast.success('Бейдж успешно изменен');
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Не удалось изменить бейдж');
    }
  };

  if (!badges?.length) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          size="sm"
          variant="ghost"
          className={cn('md:bg-secondary px-2', className)}
          endIcon={
            <ChevronDown
              data-state={open ? 'open' : 'closed'}
              className="relative size-4 transition duration-300 data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          }
        >
          <ReText
            dangerouslySetInnerHTML={{ __html: tagline }}
            color="muted-foreground"
            className="line-clamp-1 overflow-ellipsis"
            size="sm"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="max-h-80 min-w-60 overflow-auto">
        <DropdownMenuItem onClick={() => handleChange(null)}>Снять бейдж</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {badges.map(({ id: badgeId, name }) => (
            <DropdownMenuItem
              dangerouslySetInnerHTML={{ __html: name }}
              key={badgeId}
              onClick={() => handleChange(badgeId.toString())}
            />
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
