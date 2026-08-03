'use client';

import { useCallback, useMemo, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useTitlesFeedPresetsContext } from '../../../model/context';
import type { Preset } from '../../../model/types';
import type { PresetManageDialogMode, PresetManageDialogStore } from './types';

/**
 * Фильтрует пресеты по поисковому запросу
 */
const filterPresetsByQuery = (presets: Preset[], query: string): Preset[] => {
  if (!query.trim()) return presets;

  const normalizedQuery = query.toLowerCase().trim();
  return presets.filter((preset) => preset.name.toLowerCase().includes(normalizedQuery));
};

/**
 * Создает копию пресета с новым именем
 */
const createPresetCopy = (preset: Preset): Preset => ({
  name: `${preset.name} (копия)`,
  filters: { ...preset.filters },
});

/**
 * Валидирует пресет перед сохранением
 */
const validatePreset = (
  preset: Preset,
  existingPresets: Preset[],
  originalName?: string
): string => {
  if (!preset.name.trim()) {
    return 'Введите название пресета';
  }

  if (preset.name.trim().length < 2) {
    return 'Название должно содержать минимум 2 символа';
  }

  if (preset.name.trim().length > 50) {
    return 'Название не должно превышать 50 символов';
  }

  // Проверяем уникальность только если имя изменилось
  if (originalName !== preset.name) {
    const existingNames = existingPresets.map((p) => p.name.toLowerCase());
    if (existingNames.includes(preset.name.trim().toLowerCase())) {
      return 'Пресет с таким названием уже существует';
    }
  }

  if (Object.keys(preset.filters).length === 0) {
    return 'Пресет должен содержать хотя бы один фильтр';
  }

  return '';
};

const { Provider, useStore } = createContext<PresetManageDialogStore, undefined, {}>(() => {
  // External dependencies
  const { customPresets, addPreset, removePreset } = useTitlesFeedPresetsContext();

  // Local state
  const [dialogTitle, setDialogTitle] = useState('Мои пресеты');
  const [showBackButton, setShowBackButton] = useState(false);
  const [backButtonAction, setBackButtonAction] = useState<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PresetManageDialogMode>('list');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered presets based on search
  const filteredPresets = useMemo(
    () => filterPresetsByQuery(customPresets, searchQuery),
    [customPresets, searchQuery]
  );

  // Dialog control actions
  const openDialog = useCallback(() => {
    setIsOpen(true);
    setMode('list');
    setSelectedPreset(null);
    setEditingPreset(null);
    setSearchQuery('');
    setDialogTitle('Мои пресеты');
    setShowBackButton(false);
    setBackButtonAction(null);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setMode('list');
    setSelectedPreset(null);
    setEditingPreset(null);
    setSearchQuery('');
    setDialogTitle('Мои пресеты');
    setShowBackButton(false);
    setBackButtonAction(null);
  }, []);

  // Back button management
  const setBackButton = useCallback((show: boolean, action?: (() => void) | null) => {
    setShowBackButton(show);
    setBackButtonAction(() => action || null);
  }, []);

  // Mode management
  const handleSetMode = useCallback((newMode: PresetManageDialogMode) => {
    setMode(newMode);
    if (newMode === 'list') {
      setSelectedPreset(null);
      setEditingPreset(null);
    }
  }, []);

  // Preset selection and editing
  const selectPreset = useCallback((preset: Preset) => {
    setSelectedPreset(preset);
    setMode('view');
  }, []);

  const startEditing = useCallback((preset: Preset) => {
    setEditingPreset({ ...preset });
    setSelectedPreset(preset);
    setMode('edit');
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingPreset(null);
    if (selectedPreset) {
      setMode('view');
    } else {
      setMode('list');
    }
  }, [selectedPreset]);

  // Preset actions
  const savePreset = useCallback(
    (updatedPreset: Preset) => {
      const originalName = selectedPreset?.name;
      const validationError = validatePreset(updatedPreset, customPresets, originalName);

      if (validationError) {
        throw new Error(validationError);
      }

      try {
        // Remove old preset if name changed
        if (selectedPreset && selectedPreset.name !== updatedPreset.name) {
          removePreset(selectedPreset.name);
        }

        // Add updated preset
        addPreset(updatedPreset);

        setSelectedPreset(updatedPreset);
        setEditingPreset(null);
        setMode('view');
      } catch (error) {
        console.error('Failed to save preset:', error);
        throw error;
      }
    },
    [selectedPreset, customPresets, removePreset, addPreset]
  );

  const deletePreset = useCallback(
    (preset: Preset) => {
      try {
        removePreset(preset.name);
        setSelectedPreset(null);
        setEditingPreset(null);
        setMode('list');
      } catch (error) {
        console.error('Failed to delete preset:', error);
        throw error;
      }
    },
    [removePreset]
  );

  const duplicatePreset = useCallback(
    (preset: Preset) => {
      try {
        const newPreset = createPresetCopy(preset);

        // Ensure unique name
        let counter = 1;
        let finalName = newPreset.name;
        const existingNames = customPresets.map((p) => p.name.toLowerCase());

        while (existingNames.includes(finalName.toLowerCase())) {
          finalName = `${preset.name} (копия ${counter})`;
          counter++;
        }

        newPreset.name = finalName;
        addPreset(newPreset);

        setSelectedPreset(newPreset);
        setMode('view');
      } catch (error) {
        console.error('Failed to duplicate preset:', error);
        throw error;
      }
    },
    [customPresets, addPreset]
  );

  // Memoized store value
  return useMemo(
    () => ({
      // State
      dialogTitle,
      showBackButton,
      backButtonAction,
      isOpen,
      mode,
      selectedPreset,
      editingPreset,
      searchQuery,

      // Computed state
      presets: customPresets,
      filteredPresets,

      // Dialog actions
      setDialogTitle,
      setBackButton,
      openDialog,
      closeDialog,

      // Mode actions
      setMode: handleSetMode,

      // Selection actions
      selectPreset,
      startEditing,
      cancelEditing,

      // Preset actions
      savePreset,
      deletePreset,
      duplicatePreset,

      // Search actions
      setSearchQuery,
    }),
    [
      // State dependencies
      dialogTitle,
      showBackButton,
      backButtonAction,
      isOpen,
      mode,
      selectedPreset,
      editingPreset,
      searchQuery,

      // Computed state dependencies
      customPresets,
      filteredPresets,

      // Action dependencies
      setDialogTitle,
      setBackButton,
      openDialog,
      closeDialog,
      handleSetMode,
      selectPreset,
      startEditing,
      cancelEditing,
      savePreset,
      deletePreset,
      duplicatePreset,
    ]
  );
});

export const PresetManageDialogProvider = Provider;
export const usePresetManageDialog = useStore;
