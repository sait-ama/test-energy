/* eslint-disable handle-errors/log-error-in-trycatch */
import type React from 'react';

const FUNC_KEYS = {
  metaKey: 'Meta',
  ctrlKey: 'Ctrl',
  altKey: 'Alt',
  shiftKey: 'Shift',
} as const;

export const FUNC_KEYS_FIELDS = Object.keys(FUNC_KEYS) as (keyof typeof FUNC_KEYS)[];

const isFunctionalKey = (e: KeyboardEvent | React.KeyboardEvent) => {
  const code = e.code.toLowerCase();

  return ['control', 'alt', 'shift', 'meta'].some((key) => code.startsWith(key));
};

const getMainKeyName = (e: KeyboardEvent | React.KeyboardEvent): string => {
  if (isFunctionalKey(e)) return '';
  if (e.key === ' ') return 'Space';
  if (e.key.length === 1) return e.key.toUpperCase();

  return e.key;
};
const getMainKeyCode = (e: KeyboardEvent | React.KeyboardEvent): string => {
  if (isFunctionalKey(e)) return '';

  return e.code;
};

// returns rawHotkey like Ц/Ctrl+Alt+Shift+KeyW
export const createHotkey = (e: KeyboardEvent | React.KeyboardEvent): string => {
  const funcKeys = FUNC_KEYS_FIELDS.filter((field) => e[field])
    .map((field) => FUNC_KEYS[field])
    .join('+');
  const mainKeyCode = getMainKeyCode(e);
  const mainKeyName = getMainKeyName(e);

  return funcKeys ? `${mainKeyName}/${funcKeys}+${mainKeyCode}` : `${mainKeyName}/${mainKeyCode}`;
};

export const transformRawHotkey = (rawHotkey?: string | null) => {
  if (!rawHotkey || !validateHotkey(rawHotkey)) return null;

  const [mainKeyPart, identifierPart] = rawHotkey.split('/');

  const label = identifierPart!
    .split('+')
    .reduce<string[]>((acc, value, index, origArr) => {
      const item = index === origArr.length - 1 ? mainKeyPart! : value;

      return [...acc, item];
    }, [])
    .join('+');

  return {
    mainKey: mainKeyPart!,
    label,
    identifier: identifierPart!,
  };
};

export const validateHotkey = (rawHotkey?: string | null): boolean => {
  if (!rawHotkey) return false;
  try {
    const parts = rawHotkey.split('/');

    if (parts.length !== 2) return false;

    const [mainKeyNamePart, identifierPart] = parts;
    if (!mainKeyNamePart || !identifierPart) return false;

    const identifierPartArr = identifierPart.split('+');
    const funcKeys = identifierPartArr.slice(0, identifierPartArr.length - 1);
    const mainKey = identifierPartArr.slice(identifierPartArr.length - 1);

    if (!mainKey) return false;
    //@ts-ignore
    if (funcKeys.length && !funcKeys.every((key) => Object.values(FUNC_KEYS).includes(key))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};
