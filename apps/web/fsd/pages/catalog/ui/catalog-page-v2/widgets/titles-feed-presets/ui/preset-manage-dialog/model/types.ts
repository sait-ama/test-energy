import type { Preset } from '../../../model/types';

export type PresetManageDialogMode = 'list' | 'edit' | 'view';

export interface PresetManageDialogState {
  dialogTitle: string;
  showBackButton: boolean;
  backButtonAction: (() => void) | null;
  presets: Preset[];
  filteredPresets: Preset[];
  isOpen: boolean;
  mode: PresetManageDialogMode;
  selectedPreset: Preset | null;
  editingPreset: Preset | null;
  searchQuery: string;
}

export interface PresetManageDialogActions {
  setDialogTitle: (title: string) => void;
  setBackButton: (show: boolean, action?: (() => void) | null) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setMode: (mode: PresetManageDialogMode) => void;
  selectPreset: (preset: Preset) => void;
  startEditing: (preset: Preset) => void;
  cancelEditing: () => void;
  savePreset: (updatedPreset: Preset) => void;
  deletePreset: (preset: Preset) => void;
  duplicatePreset: (preset: Preset) => void;
  setSearchQuery: (query: string) => void;
}

export interface PresetManageDialogStore
  extends PresetManageDialogState,
    PresetManageDialogActions {}
