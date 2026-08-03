import type {
  BaseFilterType,
  BooleanFilterType,
  InputFilterType,
  MultiSelectFilterType,
  RangeFilterType,
  SelectFilterType,
  SelectOption,
} from './types';

/**
 * Утилита для извлечения значения из опции с учетом кастомного поля
 */
export function getOptionValue<TValue>(
  option: SelectOption<TValue>,
  valueOption: string = 'value'
): TValue | null {
  const val = option[valueOption];
  return val !== undefined ? val : null;
}

/**
 * Утилита для извлечения лейбла из опции с учетом кастомного поля
 */
export function getOptionLabel<TValue>(
  option: SelectOption<TValue>,
  labelOption: string = 'label'
): string {
  return option[labelOption] || '';
}

/**
 * Универсальная функция для создания URL сериализации
 */
function createUrlSerialization<TValue>(
  serializeFn: (value: TValue) => string | null,
  deserializeFn: (value: string | null) => TValue
) {
  return {
    serialize: serializeFn,
    deserialize: deserializeFn,
  };
}

/**
 * Создает URL сериализацию для select-подобных фильтров
 */
function createSelectUrlSync<TValue>(
  options: SelectOption<NonNullable<TValue>>[],
  valueOption: string = 'value'
) {
  return createUrlSerialization<TValue | null>(
    (value) => (value ? String(value) : null),
    (value) => {
      if (!value) return null;
      const option = options.find((opt) => {
        const optValue = getOptionValue(opt, valueOption);
        return optValue !== null && String(optValue) === value;
      });
      return option ? getOptionValue(option, valueOption) : null;
    }
  );
}

/**
 * Создает URL сериализацию для multi-select фильтров
 */
function createMultiSelectUrlSync<TValue>(
  options: SelectOption<NonNullable<TValue>>[],
  valueOption: string = 'value'
) {
  return createUrlSerialization<TValue[]>(
    (value) => (value.length > 0 ? value.map(String).join(',') : null),
    (value) => {
      if (!value) return [];
      return value.split(',').reduce((acc: TValue[], val) => {
        const option = options.find((opt) => {
          const optValue = getOptionValue(opt, valueOption);
          return optValue !== null && String(optValue) === val.trim();
        });
        if (option) {
          const optValue = getOptionValue(option, valueOption);
          if (optValue !== null) acc.push(optValue);
        }
        return acc;
      }, []);
    }
  );
}

/**
 * Создает URL сериализацию для строковых фильтров
 */
function createStringUrlSync() {
  return createUrlSerialization<string>(
    (value) => (value.trim() ? value.trim() : null),
    (value) => value || ''
  );
}

/**
 * Создает URL сериализацию для boolean фильтров
 */
function createBooleanUrlSync() {
  return createUrlSerialization<boolean>(
    (value) => (value ? 'true' : null),
    (value) => value === 'true'
  );
}

/**
 * Создает URL сериализацию для range фильтров
 */
function createRangeUrlSync() {
  return createUrlSerialization<{ min: number | null; max: number | null }>(
    (value) => {
      if (value.min === null && value.max === null) return null;
      return `${value.min || ''}-${value.max || ''}`;
    },
    (value) => {
      if (!value) return { min: null, max: null };
      const [minStr, maxStr] = value.split('-');
      return {
        min: minStr ? Number(minStr) : null,
        max: maxStr ? Number(maxStr) : null,
      };
    }
  );
}

/**
 * Утилита для применения сериализации к конфигу
 */
function applyUrlSyncToConfig<
  T extends BaseFilterType<any> | SelectFilterType<any> | MultiSelectFilterType<any>,
>(
  config: T,
  customSerialize?: any,
  customDeserialize?: any,
  autoSyncFactory?: () => { serialize: any; deserialize: any }
): T {
  // Если переданы кастомные функции - используем их
  if (customSerialize || customDeserialize) {
    if (customSerialize) config.serialize = customSerialize;
    if (customDeserialize) config.deserialize = customDeserialize;
    return config;
  }

  // Если есть автоматическая фабрика - используем её
  if (autoSyncFactory) {
    const { serialize, deserialize } = autoSyncFactory();
    config.serialize = serialize;
    config.deserialize = deserialize;
  }

  return config;
}

/**
 * Базовая функция для создания любого фильтра
 */
export function createFilter<TValue = any>(config: BaseFilterType<TValue>) {
  return { ...config };
}

/**
 * Создает конфигурацию для Select фильтра
 */
export function createSelectFilter<TValue = string>(
  config: {
    name: string;
    label: string;
    options: SelectOption<NonNullable<TValue>>[];
    defaultValue?: TValue | null;
    placeholder?: string;
    valueOption?: string;
    labelOption?: string;
    withUrlSync?: boolean;
    disabled?: boolean;
    serialize?: (value: TValue | null) => string | null;
    deserialize?: (value: string | null) => TValue | null;
    serializeToRequest?: (value: TValue | null, fieldName: string) => Record<string, any>;
  } & Record<string, any>
): SelectFilterType<TValue | null> {
  const {
    name,
    label,
    options,
    defaultValue = null,
    placeholder,
    valueOption = 'value',
    labelOption = 'label',
    withUrlSync = false,
    disabled = false,
    serialize: customSerialize,
    deserialize: customDeserialize,
    ...customFields
  } = config;

  const normalizedOptions = options.map((option) => ({
    ...option,
    value: getOptionValue(option, valueOption),
    label: getOptionLabel(option, labelOption),
  }));

  const baseConfig: SelectFilterType<TValue | null> = {
    type: 'select',
    name,
    label,
    options: normalizedOptions,
    defaultValue,
    placeholder,
    disabled,
    serializeToRequest: config.serializeToRequest,
    ...customFields, // Добавляем кастомные поля через спред
  } as any;

  if (withUrlSync) {
    return applyUrlSyncToConfig(baseConfig, customSerialize, customDeserialize, () =>
      createSelectUrlSync(options, valueOption)
    );
  }

  return baseConfig;
}

/**
 * Создает конфигурацию для MultiSelect фильтра
 */
export function createMultiSelectFilter<TValue = string>(
  config: {
    name: string;
    label: string;
    options: SelectOption<NonNullable<TValue>>[];
    defaultValue?: TValue[];
    maxSelections?: number;
    placeholder?: string;
    valueOption?: string;
    labelOption?: string;
    withUrlSync?: boolean;
    disabled?: boolean;
    serialize?: (value: TValue[]) => string | null;
    deserialize?: (value: string | null) => TValue[];
    serializeToRequest?: (value: TValue[], fieldName: string) => Record<string, any>;
  } & Record<string, any>
): MultiSelectFilterType<TValue> {
  const {
    name,
    label,
    options,
    defaultValue = [],
    maxSelections,
    placeholder,
    valueOption = 'value',
    labelOption = 'label',
    withUrlSync = false,
    disabled = false,
    serialize: customSerialize,
    deserialize: customDeserialize,
    ...customFields
  } = config;

  const baseConfig: MultiSelectFilterType<TValue> = {
    type: 'multiselect',
    name,
    label,
    options,
    defaultValue,
    maxSelections,
    placeholder,
    disabled,
    serializeToRequest: config.serializeToRequest,
    ...customFields, // Добавляем кастомные поля через спред
  } as any;

  if (withUrlSync) {
    return applyUrlSyncToConfig(baseConfig, customSerialize, customDeserialize, () =>
      createMultiSelectUrlSync(options, valueOption)
    );
  }

  return baseConfig;
}

/**
 * Создает конфигурацию для Input фильтра
 */
export function createInputFilter(
  config: {
    name: string;
    label: string;
    defaultValue?: string;
    placeholder?: string;
    minLength?: number;
    debounceMs?: number;
    withUrlSync?: boolean;
    disabled?: boolean;
    serialize?: (value: string) => string | null;
    deserialize?: (value: string | null) => string;
    serializeToRequest?: (value: string, fieldName: string) => Record<string, any>;
    options?: Array<{
      value: string;
      label: string;
      description?: string;
      disabled?: boolean;
    }>;
  } & Record<string, any>
): InputFilterType {
  const {
    name,
    label,
    defaultValue = '',
    placeholder,
    minLength,
    debounceMs,
    withUrlSync = false,
    disabled = false,
    serialize: customSerialize,
    deserialize: customDeserialize,
    options,
    ...customFields
  } = config;

  const baseConfig: InputFilterType = {
    type: 'input',
    name,
    label,
    defaultValue,
    placeholder,
    minLength,
    debounceMs,
    disabled,
    options,
    serializeToRequest: config.serializeToRequest,
    ...customFields, // Добавляем кастомные поля через спред
  } as any;

  if (withUrlSync) {
    return applyUrlSyncToConfig(baseConfig, customSerialize, customDeserialize, () =>
      createStringUrlSync()
    );
  }

  return baseConfig;
}

/**
 * Создает конфигурацию для Range фильтра
 */
export function createRangeFilter(
  config: {
    name: string;
    label: string;
    min: number;
    max: number;
    defaultValue?: { min: number | null; max: number | null };
    step?: number;
    unitLabel?: string;
    withUrlSync?: boolean;
    disabled?: boolean;
    serialize?: (value: { min: number | null; max: number | null }) => string | null;
    deserialize?: (value: string | null) => { min: number | null; max: number | null };
    serializeToRequest?: (
      value: { min: number | null; max: number | null },
      fieldName: string
    ) => Record<string, any>;
    options?: Array<{
      value: { min: number | null; max: number | null };
      label: string;
      description?: string;
      disabled?: boolean;
    }>;
  } & Record<string, any>
): RangeFilterType {
  const {
    name,
    label,
    min,
    max,
    defaultValue = { min: null, max: null },
    step,
    unitLabel,
    withUrlSync = false,
    disabled = false,
    serialize: customSerialize,
    deserialize: customDeserialize,
    options,
    ...customFields
  } = config;

  const baseConfig: RangeFilterType = {
    type: 'range',
    name,
    label,
    min,
    max,
    defaultValue,
    step,
    unitLabel,
    disabled,
    options,
    serializeToRequest: config.serializeToRequest,
    ...customFields, // Добавляем кастомные поля через спред
  } as any;

  if (withUrlSync) {
    return applyUrlSyncToConfig(baseConfig, customSerialize, customDeserialize, () =>
      createRangeUrlSync()
    );
  }

  return baseConfig;
}

/**
 * Создает конфигурацию для Boolean фильтра
 */
export function createBooleanFilter(
  config: {
    name: string;
    label: string;
    defaultValue?: boolean;
    description?: string;
    withUrlSync?: boolean;
    disabled?: boolean;
    serialize?: (value: boolean) => string | null;
    deserialize?: (value: string | null) => boolean;
    serializeToRequest?: (value: boolean, fieldName: string) => Record<string, any>;
    options?: Array<{
      value: boolean;
      label: string;
      description?: string;
      disabled?: boolean;
    }>;
  } & Record<string, any>
): BooleanFilterType {
  const {
    name,
    label,
    defaultValue = false,
    description,
    withUrlSync = false,
    disabled = false,
    serialize: customSerialize,
    deserialize: customDeserialize,
    options,
    ...customFields
  } = config;

  const baseConfig: BooleanFilterType = {
    type: 'boolean',
    name,
    label,
    defaultValue,
    description,
    disabled,
    options,
    serializeToRequest: config.serializeToRequest,
    ...customFields, // Добавляем кастомные поля через спред
  } as any;

  if (withUrlSync) {
    return applyUrlSyncToConfig(baseConfig, customSerialize, customDeserialize, () =>
      createBooleanUrlSync()
    );
  }

  return baseConfig;
}
