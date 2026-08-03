import type { TitleFiltersPreset } from '../../../model/types';

export type PresetSaveDialogStep = 'filters-review' | 'preset-naming';

export interface PresetSaveDialogState {
  isOpen: boolean;
  currentStep: PresetSaveDialogStep;
  editableFilters: TitleFiltersPreset;
  presetName: string;
}

export interface PresetSaveDialogActions {
  openDialog: () => void;
  closeDialog: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setPresetName: (name: string) => void;
  removeFilterValue: (filterKey: string, value?: any) => void;
  clearFilter: (filterKey: string) => void;
  savePreset: () => void;
}

export interface PresetSaveDialogStore extends PresetSaveDialogState, PresetSaveDialogActions {}
