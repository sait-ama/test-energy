import { memo } from 'react';

import { usePresetManageDialog } from '../../model/context';
import { PresetEdit } from '../preset-edit';
import { PresetList } from '../preset-list';
import { PresetView } from '../preset-view';

export const PresetManageModalContent = memo(() => {
  const { mode } = usePresetManageDialog();

  switch (mode) {
    case 'list':
      return <PresetList />;
    case 'view':
      return <PresetView />;
    case 'edit':
      return <PresetEdit />;
    default:
      return null;
  }
});

PresetManageModalContent.displayName = 'PresetManageModalContent';
