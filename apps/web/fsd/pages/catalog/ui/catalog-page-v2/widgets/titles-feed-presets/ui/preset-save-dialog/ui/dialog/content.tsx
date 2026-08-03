import { memo } from 'react';

import { usePresetSaveDialog } from '../../model/context';
import { FiltersReviewStep } from '../steps/filters-review-step';
import { PresetNamingStep } from '../steps/preset-naming-step';

export const PresetSaveModalContent = memo(() => {
  const { currentStep } = usePresetSaveDialog();

  switch (currentStep) {
    case 'filters-review':
      return <FiltersReviewStep />;
    case 'preset-naming':
      return <PresetNamingStep />;
    default:
      return null;
  }
});

PresetSaveModalContent.displayName = 'PresetSaveModalContent';
