'use client';

import { Button } from '@re/ui-kit/ui/button';

import { useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { ClubPassRequestButton } from '~features/guild-pass-request/ui/guild-pass-request-guild';

export const ClubPassRequest = () => {
  const { data, isLoading } = useGuildSuspenseQuery();
  const { is_public, is_waiting, is_member, is_creator } = data ?? {};
  if (isLoading) return null;
  if (is_creator) return null;
  if (is_member) return null; //<LeaveClubButton />;
  if (is_waiting)
    return (
      <Button size="sm" className="" color="primary" variant="flat" disabled>
        Заявка отправлена
      </Button>
    );

  return <ClubPassRequestButton />;
};
