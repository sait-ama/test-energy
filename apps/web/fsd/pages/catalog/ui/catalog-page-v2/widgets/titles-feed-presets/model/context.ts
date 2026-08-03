'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { createContext } from '@re/core/utils/create-context';

import { useCookieState } from '~shared/hooks/use-cookie-state';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';

import { useTitleFiltersStore } from '../../../features/title-filters/model/context';
import { CUSTOM_PRESETS_COOKIE_KEY, DEFAULT_PRESETS } from './constants';
import { Preset } from './types';
import { isExactPreset } from './utils';

type TitlesFeedPresetsContextType = {
  customPresets: Preset[];
  presets: Preset[];
  activePreset?: Preset | null;
  togglePreset: (preset: Preset) => void;
  isActivePreset: (preset: Preset) => boolean;
  addPreset: (preset: Preset) => void;
  removePreset: (presetName: string) => void;
};

type TitlesFeedPresetsProps = {
  defaultPresets?: Preset[];
  defaultCustomPresets?: Preset[];
  enableCustomPresets?: boolean;
};

function isValidPresets(presets: Preset[]): boolean {
  return (
    Array.isArray(presets) &&
    presets.every(
      (preset) =>
        typeof preset === 'object' && preset !== null && 'name' in preset && 'filters' in preset
    )
  );
}

const { Provider, useStore } = createContext<
  TitlesFeedPresetsContextType,
  undefined,
  TitlesFeedPresetsProps
>(
  (
    _value,
    { defaultPresets = DEFAULT_PRESETS, defaultCustomPresets, enableCustomPresets = true } = {}
  ) => {
    const [customPresets, setCustomPresets] = useCookieState<Preset[]>(
      CUSTOM_PRESETS_COOKIE_KEY,
      defaultCustomPresets ?? []
    );

    const presets = useMemo(() => {
      if (enableCustomPresets && isValidPresets(customPresets)) {
        return [...customPresets, ...defaultPresets];
      }

      return defaultPresets;
    }, [defaultPresets, enableCustomPresets, customPresets]);

    const setFilters = useTitleFiltersStore((v) => v.setFiltersValues);
    const resetFilters = useTitleFiltersStore((v) => v.resetAllFilters);

    const [activePreset, setActivePreset] = useState<Preset | null>(null);

    const activeFilters = useTitleFiltersStore((v) => v.filters);
    const schema = useTitleFiltersStore((v) => v.schema);

    const [debouncedActiveFilters] = useDebouncedValue(activeFilters, 300);

    useEffect(() => {
      const preset = presets.find((preset) =>
        isExactPreset(preset, debouncedActiveFilters, schema)
      );
      setActivePreset(preset ?? null);
    }, [presets, debouncedActiveFilters, schema]);

    const isActivePreset = useCallback(
      (preset: Preset) => {
        return activePreset?.name === preset.name;
      },
      [activePreset]
    );

    const togglePreset = useCallback(
      (preset: Preset) => {
        if (isActivePreset(preset)) {
          setActivePreset(null);
          resetFilters();
        } else {
          setActivePreset(preset);
          setFilters(preset.filters, { merge: true });
        }
      },
      [isActivePreset, resetFilters, setFilters]
    );

    const addPreset = useCallback(
      (preset: Preset) => {
        if (!enableCustomPresets) {
          console.warn('Custom presets are disabled');
          return;
        }

        setCustomPresets((prev) => {
          // Проверяем, что пресет с таким именем не существует
          const existingNames = [...prev, ...defaultPresets].map((p) => p.name.toLowerCase());
          if (existingNames.includes(preset.name.toLowerCase())) {
            console.warn(`Preset with name "${preset.name}" already exists`);
            return prev;
          }

          return [preset, ...prev];
        });
      },
      [enableCustomPresets, setCustomPresets, defaultPresets]
    );

    const removePreset = useCallback(
      (presetName: string) => {
        if (!enableCustomPresets) {
          console.warn('Custom presets are disabled');
          return;
        }

        setCustomPresets((prev) => prev.filter((p) => p.name !== presetName));

        // Если удаляемый пресет был активным, сбрасываем его
        if (activePreset?.name === presetName) {
          setActivePreset(null);
        }
      },
      [enableCustomPresets, setCustomPresets, activePreset]
    );

    return {
      customPresets,
      presets,
      activePreset,
      togglePreset,
      isActivePreset,
      addPreset,
      removePreset,
    };
  }
);

export const TitlesFeedPresetsProvider = Provider;
export const useTitlesFeedPresetsContext = useStore;
