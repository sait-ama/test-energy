'use client';

import { memo, useCallback, useState } from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Input } from '@re/ui-kit/ui/input';

import { useTitlesFeedPresetsContext } from '../../../../model/context';
import { usePresetSaveDialog } from '../../model/context';

export const PresetNamingStep = memo(() => {
  const { presetName, setPresetName, prevStep, closeDialog, savePreset } = usePresetSaveDialog();
  const { presets } = useTitlesFeedPresetsContext();

  const [error, setError] = useState<string>('');

  const validateName = useCallback(
    (name: string): string => {
      if (!name.trim()) {
        return 'Введите название пресета';
      }

      if (name.trim().length < 2) {
        return 'Название должно содержать минимум 2 символа';
      }

      if (name.trim().length > 30) {
        return 'Название не должно превышать 30 символов';
      }

      const existingNames = presets.map((p) => p.name.toLowerCase());
      if (existingNames.includes(name.trim().toLowerCase())) {
        return 'Пресет с таким названием уже существует';
      }

      return '';
    },
    [presets]
  );

  const handleNameChange = useCallback(
    (value: string) => {
      setPresetName(value);
      if (error) {
        const validationError = validateName(value);
        setError(validationError);
      }
    },
    [setPresetName, error, validateName]
  );

  const handleSave = useCallback(() => {
    const validationError = validateName(presetName);
    if (validationError) {
      setError(validationError);
      return;
    }

    savePreset();
  }, [presetName, validateName, savePreset]);

  const isValid = !error && presetName.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mt-1 text-sm">
          Введите уникальное название для сохранения набора фильтров
        </p>
      </div>

      <div className="space-y-2">
        <Input
          id="preset-name"
          placeholder="Название пресета"
          value={presetName}
          onChange={(e) => handleNameChange(e.target.value)}
          className={error ? 'border-destructive' : ''}
          maxLength={30}
          autoFocus
        />
        <div className="px-2">
          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : (
            <p className="text-muted-foreground text-xs">{presetName.length}/30 символов</p>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={prevStep}>
          Назад
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          Сохранить пресет
        </Button>
      </div>
    </div>
  );
});

PresetNamingStep.displayName = 'PresetNamingStep';
