import Activity from '@re/ui-kit/icons/activity';
import Add from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { ButtonGroup } from '@re/ui-kit/ui/button-group';

import { useExchangeModal } from '~shared/lib/exchange/use-exchnage-modal';
import { useSession } from '~shared/lib/session/use-session';
import { useTourItem } from '~shared/lib/tour/items';

export const CoinsBalance = () => {
  const balance = useSession((v) => v?.coins);
  const { open } = useExchangeModal();
  const tourProps = useTourItem('shop-coins-balance');

  if (balance === undefined) return null;

  return (
    <ButtonGroup {...tourProps}>
      <Button color="secondary" startIcon={<Activity className="size-4" />}>
        {balance}
      </Button>
      <Button onClick={open} circle color="secondary" className="border-border border-l">
        <Add className="size-4 text-black dark:text-white" />
      </Button>
    </ButtonGroup>
  );
};
