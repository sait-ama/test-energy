'use client';

import { useCallback, useMemo, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useTitleFiltersStore } from '../../../../../features/title-filters/model/context';
import { useTitlesFeedPresetsContext } from '../../../model/context';
import type { TitleFiltersPreset } from '../../../model/types';
import type { PresetSaveDialogStep, PresetSaveDialogStore } from './types';

/**
 * Извлекает активные фильтры в формате для пресета
 */
const extractActiveFilters = (activeFilters: Record<string, unknown>): TitleFiltersPreset => {
  const result: TitleFiltersPreset = {};

  Object.entries(activeFilters).forEach(([key, filterState]) => {
    if (
      filterState &&
      typeof filterState === 'object' &&
      'isActive' in filterState &&
      'value' in filterState
    ) {
      const state = filterState as { isActive: boolean; value: unknown };
      if (state.isActive && state.value !== undefined) {
        (result as Record<string, unknown>)[key] = state.value;
      }
    }
  });

  return result;
};

/**
 * Проверяет возможность сохранения пресета
 */
const canSavePreset = (name: string, filters: TitleFiltersPreset): boolean => {
  return Boolean(name.trim() && Object.keys(filters).length > 0);
};

/**
 * Безопасное удаление свойства из объекта
 */
const removeProperty = <T extends Record<string, unknown>>(
  obj: T,
  key: string
): Omit<T, string> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _removed, ...rest } = obj;
  return rest as Omit<T, string>;
};

const { Provider, useStore } = createContext<PresetSaveDialogStore, undefined, {}>(() => {
  // External dependencies
  const activeFilters = useTitleFiltersStore((v) => v.activeFilters);
  const schema = useTitleFiltersStore((v) => v.schema);
  const { addPreset } = useTitlesFeedPresetsContext();

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<PresetSaveDialogStep>('filters-review');
  const [presetName, setPresetName] = useState('');
  const [editableFilters, setEditableFilters] = useState<TitleFiltersPreset>({});

  // Dialog control actions
  const openDialog = useCallback(() => {
    const initialFilters = extractActiveFilters(activeFilters);

    setEditableFilters(initialFilters);
    setCurrentStep('filters-review');
    setPresetName('');
    setIsOpen(true);
  }, [activeFilters]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setCurrentStep('filters-review');
    setPresetName('');
    setEditableFilters({});
  }, []);

  // Step navigation
  const nextStep = useCallback(() => {
    if (currentStep === 'filters-review') {
      setCurrentStep('preset-naming');
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep === 'preset-naming') {
      setCurrentStep('filters-review');
    }
  }, [currentStep]);

  // Filter editing actions
  const removeFilterValue = useCallback(
    (filterKey: string, valueToRemove?: unknown) => {
      setEditableFilters((prev) => {
        const filterSchema = (schema as Record<string, { type: string }>)[filterKey];
        const currentValue = (prev as Record<string, unknown>)[filterKey];

        if (!filterSchema || currentValue === undefined) {
          return prev;
        }

        // Handle MULTISELECT filters - remove specific value
        if (filterSchema.type === 'MULTISELECT' && Array.isArray(currentValue)) {
          const filteredValues = currentValue.filter((value) => value !== valueToRemove);

          // If no values left, remove the entire filter
          if (filteredValues.length === 0) {
            return removeProperty(prev, filterKey) as TitleFiltersPreset;
          }

          // Update with filtered values
          return { ...prev, [filterKey]: filteredValues };
        }

        // For other filter types, remove the entire filter
        return removeProperty(prev, filterKey) as TitleFiltersPreset;
      });
    },
    [schema]
  );

  const clearFilter = useCallback((filterKey: string) => {
    setEditableFilters((prev) => removeProperty(prev, filterKey) as TitleFiltersPreset);
  }, []);

  // Preset saving
  const savePreset = useCallback(() => {
    if (!canSavePreset(presetName, editableFilters)) {
      console.warn('Cannot save preset: invalid name or empty filters');
      return;
    }

    const newPreset = {
      name: presetName.trim(),
      filters: editableFilters,
    };

    try {
      addPreset(newPreset);
      closeDialog();
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  }, [presetName, editableFilters, addPreset, closeDialog]);

  // Memoized store value
  return useMemo(
    () => ({
      // State
      isOpen,
      currentStep,
      editableFilters,
      presetName,

      // Dialog actions
      openDialog,
      closeDialog,

      // Navigation actions
      nextStep,
      prevStep,

      // Editing actions
      setPresetName,
      removeFilterValue,
      clearFilter,

      // Save action
      savePreset,
    }),
    [
      // State dependencies
      isOpen,
      currentStep,
      editableFilters,
      presetName,

      // Action dependencies
      openDialog,
      closeDialog,
      nextStep,
      prevStep,
      removeFilterValue,
      clearFilter,
      savePreset,
    ]
  );
});

export const PresetSaveDialogProvider = Provider;
export const usePresetSaveDialog = useStore;
