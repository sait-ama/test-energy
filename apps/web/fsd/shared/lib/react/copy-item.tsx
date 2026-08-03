import { ForwardRefExoticComponent, memo, PropsWithoutRef, RefAttributes } from 'react';

import Save from '@re/ui-kit/icons/save';
import { Button } from '@re/ui-kit/ui/button';
import { IconProps } from '@re/ui-kit/ui/icon';

import { logger } from '~shared/lib/logger';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface CopyItemProps {
  value: string;
  Icon?: ForwardRefExoticComponent<PropsWithoutRef<IconProps> & RefAttributes<SVGSVGElement>>;
}

const DefaultIcon: Required<CopyItemProps>['Icon'] = Save;
export const CopyItem = memo((props: CopyItemProps) => {
  const { value, Icon = DefaultIcon } = props;
  const onClick = async () => {
    const toast = await importToastAsync();

    try {
      await navigator.clipboard.writeText(value);
      toast.success('Значение скопировано');
    } catch (e: unknown) {
      logger.error(e);
      toast.error('Не получилось скопировать значение');
    }
  };

  return (
    <Button circle variant="ghost" size="xs" onClick={onClick}>
      <Icon className="text-current-color size-4" />
    </Button>
  );
});
