export enum BaseFilterTypes {
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  INPUT = 'input',
  RANGE = 'range',
  BOOLEAN = 'boolean',
}

/**
 * Базовая опция для пресетов фильтров
 */
export type BaseFilterOption<TValue = any> = {
  /** Значение которое будет установлено */
  value: TValue;
  /** Отображаемый текст */
  label: string;
  /** Описание пресета (опционально) */
  description?: string;
  /** Отключен ли пресет */
  disabled?: boolean;
};

/**
 * Опция для select-фильтров с типизированными ключами
 */
export type SelectOption<
  TValue = string,
  ValueKey extends string | number = 'value',
  LabelKey extends string = 'label',
> = {
  [K in ValueKey]?: TValue | null;
} & {
  [K in LabelKey]?: string;
} & {
  disabled?: boolean;
  [key: string]: any;
};

/**
 * Базовый интерфейс для любого типа фильтра
 * Каждый конкретный тип фильтра должен его имплементировать
 */
export interface BaseFilterType<TValue = any> {
  /** Тип фильтра */
  type: BaseFilterTypes;
  /** Уникальный ключ фильтра */
  name: string;
  /** Человекочитаемое название */
  label: string;
  /** Значение по умолчанию (опционально) */
  defaultValue?: TValue;
  /** Сериализация значения в строку для URL (опционально) */
  serialize?: (value: TValue) => string | null;
  /** Десериализация значения из строки URL (опционально) */
  deserialize?: (value: string | null) => TValue;
  /**
   * Сериализация значения в формат для отправки на бэкенд (опционально)
   * Возвращает объект с парами ключ-значение для query параметров
   * Например, range фильтр может вернуть { fieldName_gte: min, fieldName_lte: max }
   */
  serializeToRequest?: (value: TValue, fieldName: string) => Record<string, any>;
  /**
   * Опции пресетов для быстрого выбора значений (опционально)
   * Позволяет пользователю быстро установить определенные значения одним кликом
   */
  options?: BaseFilterOption<TValue>[];
  /** Отключен ли фильтр (не показывается в UI) */
  disabled?: boolean;
  /** Активен ли фильтр по умолчанию */
  isActive?: boolean;
}

/**
 * Union тип всех возможных типов фильтров
 */
export type AnyFilterType =
  | BaseFilterType
  | SelectFilterType<any, any, any>
  | MultiSelectFilterType<any, any, any>
  | InputFilterType
  | RangeFilterType
  | BooleanFilterType;

/**
 * Состояние одного фильтра
 */
export interface FilterState<T extends AnyFilterType> {
  value: T extends BaseFilterType<infer U>
    ? U
    : T extends SelectFilterType<infer U>
      ? U
      : T extends MultiSelectFilterType<infer U>
        ? U[]
        : T extends InputFilterType
          ? string
          : T extends RangeFilterType
            ? { min: number | null; max: number | null }
            : T extends BooleanFilterType
              ? boolean
              : never;
  isActive: boolean;
}

/**
 * Мапа всех фильтров в сторе
 */
export type FiltersState<TFilterTypes extends FilterTypeConstraint> = {
  [K in keyof TFilterTypes]: FilterState<TFilterTypes[K]>;
};

/**
 * Конфигурация фильтров - схема всех доступных фильтров
 */
export type FiltersSchema<TFilterTypes extends FilterTypeConstraint> = {
  [K in keyof TFilterTypes]: TFilterTypes[K];
};

/**
 * Тип для определения схемы фильтров
 * Используется как constraint для generic типов
 */
export type FilterTypeConstraint = Record<string, AnyFilterType>;

/**
 * Вспомогательный тип для извлечения типа значения фильтра
 */
export type FilterValue<T extends AnyFilterType> =
  T extends BaseFilterType<infer U>
    ? U
    : T extends SelectFilterType<infer U>
      ? U
      : T extends MultiSelectFilterType<infer U>
        ? U[]
        : T extends InputFilterType
          ? string
          : T extends RangeFilterType
            ? { min: number | null; max: number | null }
            : T extends BooleanFilterType
              ? boolean
              : never;

/**
 * Вспомогательный тип для извлечения всех значений из схемы фильтров
 */
export type FiltersValues<TFilterTypes extends FilterTypeConstraint> = {
  [K in keyof TFilterTypes]: FilterValue<TFilterTypes[K]>;
};

/**
 * Select фильтр (список с одним выбором)
 */
export interface SelectFilterType<
  TValue = string | null,
  ValueKey extends string = 'value',
  LabelKey extends string = 'label',
> extends Omit<BaseFilterType<TValue>, 'options'> {
  type: BaseFilterTypes.SELECT;
  options: SelectOption<NonNullable<TValue>, ValueKey, LabelKey>[];
  placeholder?: string;
}

/**
 * MultiSelect фильтр (множественный выбор)
 */
export interface MultiSelectFilterType<
  TValue = string,
  ValueKey extends string = 'value',
  LabelKey extends string = 'label',
> extends Omit<BaseFilterType<TValue[]>, 'options'> {
  type: BaseFilterTypes.MULTISELECT;
  options: SelectOption<NonNullable<TValue>, ValueKey, LabelKey>[];
  maxSelections?: number;
  placeholder?: string;
}

/**
 * Input фильтр (текстовый фильтр)
 */
export interface InputFilterType extends BaseFilterType<string> {
  type: BaseFilterTypes.INPUT;
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
}

/**
 * Range фильтр (диапазон чисел)
 */
export interface RangeFilterType
  extends BaseFilterType<{ min: number | null; max: number | null }> {
  type: BaseFilterTypes.RANGE;
  min: number;
  max: number;
  step?: number;
  unitLabel?: string;
}

/**
 * Boolean фильтр (переключатель true/false)
 */
export interface BooleanFilterType extends BaseFilterType<boolean> {
  type: BaseFilterTypes.BOOLEAN;
  description?: string;
}

/**
 * Частичное состояние фильтров для инициализации
 * Может содержать не все фильтры, каждый фильтр может быть частичным
 */
export type InitialFiltersState<TFilterTypes extends FilterTypeConstraint> = {
  [K in keyof TFilterTypes]?: Partial<FilterState<TFilterTypes[K]>>;
};

/**
 * Полное начальное состояние для инициализации стора
 * Содержит все возможные поля которые можно передать при создании стора
 */
export interface InitialState<TFilterTypes extends FilterTypeConstraint> {
  /** Начальные значения фильтров */
  filters?: InitialFiltersState<TFilterTypes>;
  // В будущем можно добавить другие поля если понадобится
  // например: metadata, settings и т.д.
}

export interface FiltersProps<TFilterTypes extends FilterTypeConstraint> {
  schema: FiltersSchema<TFilterTypes>;
  onChange?: (filters: Partial<FiltersState<TFilterTypes>>) => void;
}

/**
 * Тип для результата parseUrlToInitialState
 * Возвращает готовое состояние фильтров из URL параметров
 */
export type ParsedFiltersState<TFilterTypes extends FilterTypeConstraint> = Partial<
  FiltersState<TFilterTypes>
>;
