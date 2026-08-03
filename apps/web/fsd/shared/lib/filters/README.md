# 🔍 Универсальные фильтры

Новая архитектура с динамической схемой фильтров через Provider props.

## 🚀 Быстрый старт

### 1. Создание схемы фильтров

```tsx
import { createSelectFilter, createInputFilter, createBooleanFilter } from './model';

// Мемоизируем схему для оптимизации
const useFiltersSchema = (apiData: FiltersApiData) => {
  return useMemo(
    () => ({
      category: createSelectFilter({
        name: 'category',
        label: 'Категория',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'manga', label: 'Манга' },
          { value: 'anime', label: 'Аниме' },
        ],
        defaultValue: 'all',
        withUrlSync: true,
      }),
      search: createInputFilter({
        name: 'search',
        label: 'Поиск',
        defaultValue: '',
        withUrlSync: true,
      }),
      isCompleted: createBooleanFilter({
        name: 'completed',
        label: 'Завершенные',
        defaultValue: false,
        withUrlSync: true,
      }),
    }),
    [apiData]
  );
};
```

### 2. Создание контекста (без схемы)

```tsx
import { createFiltersContext, useUpdateFilterSchema } from './model';

// Создаем контекст БЕЗ схемы - она будет передана через Provider
const { Provider, useStore, useStoreApi } = createFiltersContext({
  hooks: [useUpdateFilterSchema], // Хук для динамического обновления схемы
  displayName: 'ProductFilters',
});
```

### 3. Использование Provider с динамической схемой

```tsx
function CatalogPage({ apiData, searchParams }) {
  // Мемоизируем схему
  const filtersSchema = useFiltersSchema(apiData);

  // Парсим URL параметры
  const initialState = useMemo(
    () => ({
      filters: parseUrlToInitialState(searchParams, filtersSchema),
    }),
    [searchParams, filtersSchema]
  );

  return (
    <Provider
      schema={filtersSchema} // Схема передается через props
      initialState={initialState}
    >
      <CatalogFilters />
      <CatalogResults />
    </Provider>
  );
}
```

## 📋 Паттерны использования

### Статическая схема

```tsx
function StaticFiltersExample() {
  // Статическая схема - мемоизируем один раз
  const schema = useMemo(
    () => ({
      category: createSelectFilter({
        name: 'category',
        label: 'Категория',
        options: [
          { value: 'all', label: 'Все' },
          { value: 'manga', label: 'Манга' },
        ],
        defaultValue: 'all',
        withUrlSync: true,
      }),
    }),
    []
  );

  return (
    <Provider schema={schema}>
      <FilterComponents />
    </Provider>
  );
}
```

### Динамическая схема с API данными

```tsx
function DynamicFiltersExample() {
  const { data: apiData } = useQuery(['filters-data'], fetchFiltersData);

  // Динамическая схема - пересчитывается при изменении API данных
  const schema = useMemo(() => {
    if (!apiData) return undefined;

    return {
      categories: createSelectFilter({
        name: 'categories',
        label: 'Категории',
        options: [
          { value: null, label: 'Все категории' },
          ...apiData.categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          })),
        ],
        withUrlSync: true,
      }),
      genres: createMultiSelectFilter({
        name: 'genres',
        label: 'Жанры',
        options: apiData.genres.map((genre) => ({
          value: genre.id,
          label: genre.name,
        })),
        withUrlSync: true,
      }),
    };
  }, [apiData]);

  // Пока схема не готова - показываем загрузку
  if (!schema) {
    return <LoadingSkeleton />;
  }

  return (
    <Provider schema={schema}>
      <FilterComponents />
    </Provider>
  );
}
```

### Схема с правами доступа

```tsx
function PermissionBasedFilters() {
  const { user } = useAuth();

  const schema = useMemo(() => {
    const baseSchema = {
      search: createInputFilter({
        name: 'search',
        label: 'Поиск',
        withUrlSync: true,
      }),
    };

    // Добавляем расширенные фильтры для авторизованных пользователей
    if (user?.isAuthenticated) {
      baseSchema.favorites = createBooleanFilter({
        name: 'favorites',
        label: 'Только избранное',
        withUrlSync: true,
      });
    }

    // Добавляем админские фильтры
    if (user?.role === 'admin') {
      baseSchema.status = createSelectFilter({
        name: 'status',
        label: 'Статус модерации',
        options: [
          { value: 'pending', label: 'На модерации' },
          { value: 'approved', label: 'Одобрено' },
          { value: 'rejected', label: 'Отклонено' },
        ],
        withUrlSync: true,
      });
    }

    return baseSchema;
  }, [user?.isAuthenticated, user?.role]);

  return (
    <Provider schema={schema}>
      <FilterComponents />
    </Provider>
  );
}
```

## 🔄 Ручное обновление схемы

Если нужно обновить схему программно (без пересоздания Provider):

```tsx
function ManualSchemaUpdate() {
  const { updateSchema } = useStore();
  const [apiData, setApiData] = useState(null);

  const handleDataUpdate = async () => {
    const newData = await fetchNewFiltersData();
    setApiData(newData);

    // Создаем новую схему
    const newSchema = {
      categories: createSelectFilter({
        name: 'categories',
        label: 'Категории',
        options: newData.categories.map((cat) => ({
          value: cat.id,
          label: cat.name,
        })),
        withUrlSync: true,
      }),
    };

    // Обновляем схему в сторе (сохраняются существующие значения)
    updateSchema(newSchema);
  };

  // Остальной код...
}
```

## 📝 Создание схемы из фабрики

```tsx
// types.ts
export interface TitleFiltersOptions {
  types?: Array<{ id: number; name: string }>;
  genres?: Array<{ id: number; name: string }>;
  categories?: Array<{ id: number; name: string }>;
  ageLimits?: Array<{ id: number; name: string }>;
  statuses?: Array<{ id: number; name: string }>;
  translateStatuses?: Array<{ id: number; name: string }>;
}

// schema.ts
export function createTitleFiltersSchema(data: TitleFiltersOptions) {
  return {
    types: createSelectFilter<number | null>({
      name: 'types',
      label: 'Тип',
      options: [
        { value: null, label: 'Все типы' },
        ...(data?.types?.map((type) => ({ value: type.id, label: type.name })) || []),
      ],
      defaultValue: null,
      withUrlSync: true,
    }),

    genres: createMultiSelectFilter<number>({
      name: 'genres',
      label: 'Жанры',
      options: data?.genres?.map((genre) => ({ value: genre.id, label: genre.name })) || [],
      defaultValue: [],
      maxSelections: 5,
      withUrlSync: true,
    }),

    // ... другие фильтры
  } as const;
}

// Использование
function CatalogPage() {
  const { data: filtersData } = useQuery(['catalog-filters'], fetchCatalogFilters);

  const schema = useMemo(() => {
    return createTitleFiltersSchema(filtersData || {});
  }, [filtersData]);

  return (
    <Provider schema={schema}>
      <CatalogContent />
    </Provider>
  );
}
```

## 🔧 Хуки для управления схемой

### useUpdateFilterSchema

Автоматически обновляет схему в сторе при изменении props:

```tsx
import { createFiltersContext, useUpdateFilterSchema } from './model';

// Подключаем хук при создании контекста
const { Provider, useStore } = createFiltersContext({
  hooks: [useUpdateFilterSchema],
  displayName: 'DynamicFilters',
});

// Теперь схема будет автоматически обновляться при изменении
function App() {
  const [apiData, setApiData] = useState(null);

  const schema = useMemo(() => {
    return createFiltersSchema(apiData || {});
  }, [apiData]);

  return (
    <Provider schema={schema}>
      {/* Схема автоматически обновится при изменении apiData */}
      <FilterComponents />
    </Provider>
  );
}
```

## 🔗 Next.js App Router интеграция

### Server Components + Client Components

```tsx
// app/catalog/page.tsx (Server Component)
import { TitleFiltersOptions } from './types';

export default async function CatalogPage({ searchParams }) {
  // Получаем данные на сервере
  const filtersData: TitleFiltersOptions = await fetchFiltersData();

  return <CatalogClientPage filtersData={filtersData} searchParams={searchParams} />;
}

// catalog-client-page.tsx (Client Component)
('use client');
import { useMemo } from 'react';
import { parseUrlToInitialState } from './model';

interface Props {
  filtersData: TitleFiltersOptions;
  searchParams: Record<string, string>;
}

export function CatalogClientPage({ filtersData, searchParams }: Props) {
  // Мемоизируем схему
  const schema = useMemo(() => {
    return createTitleFiltersSchema(filtersData);
  }, [filtersData]);

  // Парсим URL параметры
  const initialState = useMemo(
    () => ({
      filters: parseUrlToInitialState(searchParams, schema),
    }),
    [searchParams, schema]
  );

  return (
    <Provider schema={schema} initialState={initialState}>
      <CatalogFilters />
      <CatalogResults />
    </Provider>
  );
}
```

### Полностью клиентская инициализация

```tsx
'use client';
import { useSearchParams } from 'next/navigation';

function ClientCatalogPage() {
  const searchParams = useSearchParams();
  const { data: filtersData } = useQuery(['filters'], fetchFiltersData);

  const schema = useMemo(() => {
    return createTitleFiltersSchema(filtersData || {});
  }, [filtersData]);

  const initialState = useMemo(() => {
    if (!schema) return undefined;

    return {
      filters: parseUrlToInitialState(searchParams, schema),
    };
  }, [searchParams, schema]);

  if (!schema) {
    return <FiltersSkeleton />;
  }

  return (
    <Provider schema={schema} initialState={initialState}>
      <CatalogContent />
    </Provider>
  );
}
```

## ⚡ Оптимизация производительности

### Мемоизация схемы

```tsx
// ✅ Правильно - мемоизируем схему
const schema = useMemo(() => {
  return createFiltersSchema(apiData);
}, [apiData]);

// ❌ Неправильно - схема создается заново при каждом рендере
const schema = createFiltersSchema(apiData);
```

### Стабильные ссылки на функции

```tsx
const { Provider } = createFiltersContext({
  hooks: [useUpdateFilterSchema], // ✅ Стабильная ссылка
  displayName: 'MyFilters',
});

// Не делайте так:
const hooks = [useUpdateFilterSchema]; // ❌ Новый массив при каждом рендере
const { Provider } = createFiltersContext({ hooks });
```

### Условная инициализация

```tsx
function ConditionalFilters({ showAdvanced }: { showAdvanced: boolean }) {
  const schema = useMemo(() => {
    const baseSchema = {
      search: createInputFilter({ name: 'search', label: 'Поиск' }),
    };

    if (showAdvanced) {
      return {
        ...baseSchema,
        advanced: createSelectFilter({
          name: 'advanced',
          label: 'Расширенный поиск',
          options: advancedOptions,
        }),
      };
    }

    return baseSchema;
  }, [showAdvanced]);

  return (
    <Provider schema={schema}>
      <FilterComponents />
    </Provider>
  );
}
```

## 🎯 Типизация

### Типы для схемы

```tsx
// Определяем тип схемы
type MyFiltersSchema = ReturnType<typeof createMyFiltersSchema>;

// Используем в компонентах
function FilterComponent() {
  const filters = useStore((state) => state.filters);
  // filters имеет тип FiltersState<MyFiltersSchema>
}
```

### Типизация props

```tsx
interface FilterPageProps {
  filtersData: TitleFiltersOptions;
  searchParams: Record<string, string>;
}

function FilterPage({ filtersData, searchParams }: FilterPageProps) {
  const schema = useMemo(() => {
    return createTitleFiltersSchema(filtersData);
  }, [filtersData]);

  // Остальной код...
}
```

## 🎨 Кастомные поля

Все helper функции поддерживают добавление произвольных полей через spread operator:

```tsx
// Базовый фильтр
const basicFilter = createSelectFilter({
  name: 'category',
  label: 'Категория',
  options: categoryOptions,
  withUrlSync: true,
});

// Фильтр с кастомными полями
const advancedFilter = createSelectFilter({
  name: 'status',
  label: 'Статус',
  options: statusOptions,
  withUrlSync: true,

  // 🎨 Кастомные поля
  icon: 'status-icon',
  tooltip: 'Выберите статус проекта',
  variant: 'outlined',
  analytics: {
    event: 'filter_status_changed',
    category: 'catalog_filters',
  },
  permissions: ['view_status_filter'],
  uiConfig: {
    showClearButton: true,
    allowMultiple: false,
  },
});

// Range фильтр с UI кастомизацией
const styledRangeFilter = createRangeFilter({
  name: 'price',
  label: 'Цена',
  min: 0,
  max: 10000,
  withUrlSync: true,

  // Кастомные поля
  currency: 'RUB',
  theme: 'premium',
  formatValue: (value) => `${value} ₽`,
  showHistogram: true,
});

// Boolean фильтр с условной логикой
const conditionalFilter = createBooleanFilter({
  name: 'favorites',
  label: 'Избранное',
  defaultValue: false,
  withUrlSync: true,

  // Условия отображения
  visible: (user) => user.isAuthenticated,
  disabled: (user) => !user.hasFavorites,
  upgradePrompt: 'Войдите чтобы использовать избранное',
});

// Input фильтр с автокомплитом
const searchFilter = createInputFilter({
  name: 'search',
  label: 'Поиск',
  placeholder: 'Введите название...',
  withUrlSync: true,

  // Автокомплит настройки
  autocomplete: {
    enabled: true,
    source: '/api/search/suggestions',
    maxItems: 10,
  },
  validation: {
    minLength: 3,
    pattern: /^[a-zA-Z0-9\s]+$/,
  },
});
```

### Доступ к кастомным полям

```tsx
function FilterComponent() {
  const statusSchema = useStore((state) => state.schema.status);

  const icon = statusSchema.icon; // 'status-icon'
  const analytics = statusSchema.analytics; // { event: '...', category: '...' }

  return (
    <div>
      {statusSchema.icon && <Icon name={statusSchema.icon} />}
      <Select {...statusSchema} />
    </div>
  );
}
```

## Хуки

### useFilterField

Композитный хук для работы с отдельными полями фильтров. Предоставляет удобный интерфейс для получения и изменения значений конкретного фильтра.

```tsx
const { useFilterField } = createFiltersContext<MyFilters>('MyFilters');

function StatusFilter() {
  const {
    schema, // Конфигурация фильтра
    value, // Текущее значение
    isActive, // Активен ли фильтр
    onChange, // Функция для изменения значения
    onReset, // Функция для сброса
  } = useFilterField('status');

  return (
    <div>
      <label>{schema.label}</label>

      {/* Доступ к кастомным полям */}
      {schema.icon && <Icon name={schema.icon} />}

      <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
        {schema.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isActive && <button onClick={onReset}>Сбросить</button>}
    </div>
  );
}
```

**Возвращаемые поля:**

- `schema` - Полная конфигурация фильтра, включая кастомные поля
- `value` - Текущее значение фильтра (типизированное)
- `isActive` - Boolean, показывает отличается ли значение от дефолтного
- `onChange` - Типизированная функция для изменения значения
- `onReset` - Функция для сброса к дефолтному значению

## Лучшие практики

## Сериализация для API запросов

Для правильной передачи данных фильтров на бэкенд используйте `serializeToRequest` функциональность.

### Добавление serializeToRequest в схему

```typescript
import {
  createRangeFilter,
  standardRangeRequestSerializer,
  createRangeRequestSerializerWithTransform,
} from '~shared/lib/filters';

// Стандартная сериализация range фильтра
const ageFilter = createRangeFilter({
  name: 'age',
  label: 'Возраст',
  min: 0,
  max: 100,
  serializeToRequest: standardRangeRequestSerializer,
  // Результат: { age_gte: 18, age_lte: 65 }
});

// Кастомная сериализация с преобразованием
const daysAgoFilter = createRangeFilter({
  name: 'last_update',
  label: 'Обновлено (дней назад)',
  min: 0,
  max: 365,
  serializeToRequest: createRangeRequestSerializerWithTransform((days) => {
    // Преобразуем дни в дату ISO строку
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }),
  // Результат: { last_update_gte: '2023-12-01', last_update_lte: '2024-01-15' }
});
```

### Использование в компонентах

```typescript
import { serializeFiltersToRequest } from '~shared/lib/filters';

function MyComponent() {
  const activeFilters = useFiltersStore((state) => state.activeFilters);
  const schema = useFiltersStore((state) => state.schema);

  const queryParams = useMemo(() => {
    return serializeFiltersToRequest(activeFilters, schema);
  }, [activeFilters, schema]);

  // queryParams готов для отправки на API
  const { data } = useQuery(['items', queryParams], () => api.getItems(queryParams));
}
```

### Кастомные serializeToRequest функции

```typescript
// Для других типов фильтров
const statusFilter = createSelectFilter({
  name: 'status',
  label: 'Статус',
  options: statusOptions,
  serializeToRequest: (value, fieldName) => {
    // Кастомная логика для select фильтра
    if (value === 'all') return {}; // Не передаем параметр
    return { [fieldName]: value };
  },
});

const tagsFilter = createMultiSelectFilter({
  name: 'tags',
  label: 'Теги',
  options: tagOptions,
  serializeToRequest: (value, fieldName) => {
    // Преобразуем массив в строку для API
    return value.length > 0 ? { [fieldName]: value.join(',') } : {};
  },
});
```

## Опции пресетов для быстрого выбора

Все типы фильтров теперь поддерживают опции пресетов, которые позволяют пользователю быстро устанавливать определенные значения одним кликом.

### Пресеты для Input фильтра

```typescript
const searchFilter = createInputFilter({
  name: 'search',
  label: 'Поиск',
  placeholder: 'Введите название...',
  options: [
    { value: 'популярные', label: 'Популярные' },
    { value: 'новинки 2024', label: 'Новинки 2024' },
    { value: 'классика', label: 'Классика', description: 'Проверенные временем' },
  ],
});
```

### Пресеты для Range фильтра

```typescript
const ageFilter = createRangeFilter({
  name: 'age',
  label: 'Возраст',
  min: 0,
  max: 100,
  options: [
    {
      value: { min: 16, max: 18 },
      label: 'Школьники',
      description: 'Подростки 16-18 лет',
    },
    {
      value: { min: 18, max: 25 },
      label: 'Молодежь',
    },
    {
      value: { min: 25, max: 40 },
      label: 'Взрослые',
    },
    {
      value: { min: 40, max: null },
      label: '40+',
      description: 'Старше 40 лет',
    },
  ],
});
```

### Пресеты для Boolean фильтра

```typescript
const premiumFilter = createBooleanFilter({
  name: 'premium',
  label: 'Премиум контент',
  options: [
    {
      value: true,
      label: 'Только премиум',
      description: 'Показать только платный контент',
    },
    {
      value: false,
      label: 'Только бесплатный',
      description: 'Показать только бесплатный контент',
    },
  ],
});
```

### Использование пресетов в UI

```typescript
function FilterComponent() {
  const { schema, value, onChange } = useFilterField('age');

  return (
    <div>
      <label>{schema.label}</label>

      {/* Основной контрол фильтра */}
      <RangeSlider value={value} onChange={onChange} />

      {/* Кнопки быстрого выбора */}
      {schema.options && (
        <div className="preset-buttons">
          {schema.options.map((option) => (
            <button
              key={option.label}
              onClick={() => onChange(option.value)}
              disabled={option.disabled}
              title={option.description}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

