import * as React from 'react';

import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@re/ui-kit/ui/popover';

import { ToggleThemeMenuItem } from '~features/account/ui/menu';
import { SnowSwitch } from '~features/snow/snow-switch';

export const UnloggedSettingsPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button circle color="secondary" title="Settings">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-4 p-6">
        <ToggleThemeMenuItem />
        <SnowSwitch />
      </PopoverContent>
    </Popover>
  );
};
