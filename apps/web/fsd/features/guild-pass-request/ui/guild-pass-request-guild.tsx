import { Button } from '@re/ui-kit/ui/button';

import { useDirDepClub, useGuildSuspenseQuery } from '~entities/guild/model/hooks';
import { useclubsCreateRequest2Club } from '~features/guild-pass-request/model/mutations';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

export const ClubPassRequestButton = () => {
  const dir = useDirDepClub();
  const { data: isPublic } = useGuildSuspenseQuery();
  const { mutateAsync: sendRequest, isPending } = useclubsCreateRequest2Club();
  const withSession = useLoggedCheck();

  const onSubmit = withSession(async () => {
    try {
      await sendRequest();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return (
    <Button loading={isPending} size="sm" className="" onClick={onSubmit}>
      {isPublic ? 'Вступить в гильдию' : 'Подать заявку'}
    </Button>
  );
};
