'use client';

import { PropsWithChildren, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { useContentType } from '~app/providers/site-config-provider';
import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import {
  FiltersState,
  parseUrlToInitialState,
  serializeFiltersToParams,
} from '~shared/lib/filters';
import { createNormalizedParams } from '~shared/lib/routing/normalization';
import { SingleOrMultiOf } from '~shared/types/global';
import { NArray } from '~shared/utils/NArray';
import { SingleOrMulti } from '~shared/utils/single-or-multi';
import { UrlBuilder } from '~shared/utils/url-formatter';
import { valueIs } from '~shared/utils/valueIs';
import { CatalogRootProps } from '~widgets/catalog/ui/catalog';

import {
  createTitleFiltersSchema,
  TitleFiltersSchema,
} from './features/title-filters/model/schema';
import { TitleFiltersOptions } from './features/title-filters/model/types';
import {
  BulkFiltersDataByDir,
  BulkFiltersDataById,
  createNormalizedRoute,
} from './model/catalog-normalized-route';
import { CatalogHeaderProvider } from './model/context';
import { TitlesFeedRoot } from './widgets/titles-feed/ui/titles-feed.client';

interface NormalizedCatalogProviderProps {
  filtersOptions: TitleFiltersOptions;
}

export const NormalizedCatalogProvider = ({
  children,
  filtersOptions,
}: PropsWithChildren<NormalizedCatalogProviderProps>) => {
  const params = useParams();
  const contentType = useContentType();
  const searchParams = useSearchParams();

  const schema = useMemo(() => createTitleFiltersSchema(filtersOptions), [filtersOptions]);

  // Создаем индексы для быстрого поиска данных фильтров
  const { bulkDataByDir, bulkDataById } = useMemo(() => {
    if (!filtersOptions) {
      return { bulkDataByDir: filtersOptions, bulkDataById: filtersOptions };
    }

    const byDir: BulkFiltersDataByDir = {};
    const byId: BulkFiltersDataById = {};

    // Создаем индексы по dir и id для каждого поля фильтров
    for (const field in filtersOptions) {
      const fieldData = filtersOptions[field];

      byDir[field] = NArray.newBy(fieldData).recordBy(
        (value) => value.dir,
        (value) => value
      );

      byId[field] = NArray.newBy(fieldData).recordBy(
        (value) => value.id,
        (value) => value
      );
    }

    return { bulkDataByDir: byDir, bulkDataById: byId };
  }, [filtersOptions]);

  // Нормализуем URL параметры в состояние фильтров
  const normalizedParams = useMemo(() => {
    if (!params?.slug || !bulkDataById || !filtersOptions) {
      return {};
    }

    // Получаем базовые нормализованные параметры из URL
    const baseNormalizedParams = createNormalizedParams(params.slug, PATH_NORMALIZATION_SCHEMA);

    const result = { ...baseNormalizedParams };

    // Преобразуем каждый параметр в формат состояния фильтра
    Object.entries(baseNormalizedParams).forEach(([key, paramOrArr]) => {
      const transformedValues = new SingleOrMulti(paramOrArr)
        .transform((value) => {
          // Ищем ID по dir или напрямую по ID
          return bulkDataByDir?.[key]?.[value]?.id || bulkDataById[key]?.[value]?.id;
        })
        .filter(Boolean); // Убираем пустые значения

      // Пропускаем если нет валидных значений
      if (
        transformedValues.isEmpty() ||
        valueIs<SingleOrMultiOf<null | undefined>>(transformedValues.value, false)
      ) {
        return;
      }

      // Формируем состояние фильтра
      result[key] = {
        value: transformedValues.value,
        isActive: true,
      };
    });

    return result;
  }, [params?.slug, filtersOptions, bulkDataById, bulkDataByDir]);

  // Обработчик изменения фильтров
  const handleFiltersChange: CatalogRootProps['onChange'] = useCallback(
    (filtersState: Partial<FiltersState<TitleFiltersSchema>>) => {
      // Создаем нормализованный маршрут из состояния фильтров
      const { normalizedPath, queryParams } = createNormalizedRoute(filtersState, bulkDataById);

      // Формируем финальный URL
      const finalUrl = new UrlBuilder()
        .add(`/${contentType}`)
        .add(normalizedPath)
        .query(serializeFiltersToParams(queryParams, schema))
        .build();

      // Обновляем URL без перезагрузки страницы
      window.history.replaceState({}, '', finalUrl);
    },
    [bulkDataById, contentType, schema]
  );

  // Объединяем нормализованные параметры с параметрами из URL query
  const initialFiltersState = useMemo(() => {
    const urlQueryState = parseUrlToInitialState(searchParams.toString(), schema);
    return { ...normalizedParams, ...urlQueryState };
  }, [normalizedParams, searchParams, schema]);

  return (
    <TitlesFeedRoot
      schema={schema}
      initialState={{ filters: initialFiltersState }}
      onChange={handleFiltersChange}
    >
      <CatalogHeaderProvider fieldSchema={schema}>{children}</CatalogHeaderProvider>
    </TitlesFeedRoot>
  );
};
