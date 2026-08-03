'use client';

import { useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { PATH_NORMALIZATION_SCHEMA } from '~pages/catalog/lib/const';
import { FormsTypes } from '~shared/api/models/forms';
import { useOpen } from '~shared/hooks/use-open';
import { createNormalizedParams } from '~shared/lib/routing/normalization';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { Underline } from '~shared/ui/underline';
import { NArray } from '~shared/utils/NArray';
import { SingleOrMulti } from '~shared/utils/single-or-multi';
import { UrlBuilder } from '~shared/utils/url-formatter';
import { valueIs } from '~shared/utils/valueIs';
import {
  CatalogDesktopFilters,
  CatalogFiltersContainer,
  CatalogList,
  CatalogMobileFilters,
  CatalogOrdering,
  CatalogPresets,
  CatalogRoot,
  CatalogRootContainer,
  CatalogRootProps,
  CatalogSearch,
  CatalogTitleListContainer,
} from '~widgets/catalog/ui/catalog';

import {
  BulkFiltersDataByDir,
  BulkFiltersDataById,
  createNormalizedRoute,
} from '../lib/catalog-normalized-route';

interface CatalogDescriptionProps {
  text: string;
}
const CatalogDescription = (props: CatalogDescriptionProps) => {
  const { text } = props;

  const [open, toggle] = useOpen();

  const shortText = useMemo(
    () => (text.split('.')[0] || '').split(' ').slice(0, 10).join(' '),
    [text]
  );

  const shouldHide = text !== shortText;

  return (
    <div>
      <ReText size="sm" color="muted-foreground" weight="semibold">
        {open ? text : `${shortText}...`}
      </ReText>
      {shouldHide ? (
        <ReText className="text-primary" asChild onClick={toggle} size="sm">
          <button>{open ? 'скрыть' : 'еще'}</button>
        </ReText>
      ) : null}
    </div>
  );
};

export const CatalogPage = () => {
  const params = useParams();

  const contentType = useContentType();

  const { data } = useQuery({
    ...getTypesBaseKey({
      get: ['status', 'categories', 'genres', 'types', 'age_limit', 'translate_status'],
      type: FormsTypes.TITLES,
    }),
    select: (v) => v.content,
  });

  const bulkDataByDir = useMemo(() => {
    if (!data) return data;
    const bulkData: BulkFiltersDataByDir = {};
    for (const field in data) {
      bulkData[field] = NArray.newBy(data[field]).recordBy(
        (value) => value.dir,
        (value) => value
      );
    }

    return bulkData;
  }, [data]);

  const bulkDataById = useMemo(() => {
    if (!data) return data;
    const bulkData: BulkFiltersDataById = {};
    for (const field in data) {
      bulkData[field] = NArray.newBy(data[field]).recordBy(
        (value) => value.id,
        (value) => value
      );
    }

    return bulkData;
  }, [data]);

  const normalizedParams = useMemo(() => {
    if (!params?.slug || !bulkDataById || !data) return {};

    const normalizedParamsInner = {
      ...createNormalizedParams(params?.slug, PATH_NORMALIZATION_SCHEMA),
    };

    Object.entries(normalizedParamsInner).forEach(([key, paramOrArr]) => {
      const singleOrMulti = new SingleOrMulti(paramOrArr)
        .transform((value) => bulkDataByDir?.[key]?.[value]?.id || bulkDataById[key]?.[value]?.id)
        .filter((v) => !!v);

      if (singleOrMulti.isEmpty()) return;
      if (valueIs<SingleOrMultiOf<null | undefined>>(singleOrMulti.value, false)) return;

      normalizedParamsInner[key] = singleOrMulti.value;
    });

    return normalizedParamsInner;
  }, [params?.slug, data, bulkDataById]);

  const handleChange: CatalogRootProps['onChange'] = useCallback(
    (values) => {
      const { normalizedPath, searchParams } = createNormalizedRoute(values, bulkDataById);

      const url = new UrlBuilder()
        .add(`/${contentType}`)
        .add(normalizedPath)
        .query(searchParams)
        .build();

      window.history.replaceState({}, '', url);
    },
    [bulkDataById]
  );

  const fieldSchema = useMemo(() => {
    const paramsArray = Object.entries(normalizedParams);

    if (paramsArray.length > 1) return;

    const [field, id] = paramsArray[0] || [];

    if (!field || !id || (Array.isArray(id) && id.length > 1) || !bulkDataById) return;

    return { ...bulkDataById[field]![Number(id)]!, field };
  }, [normalizedParams, bulkDataById]);

  return (
    <CatalogRoot onChange={handleChange} overrides={normalizedParams}>
      <div className="my-2 flex items-center justify-between md:my-4">
        <div className="flex flex-col gap-2">
          <Underline>
            <ReText size="xl" weight="semibold">
              {fieldSchema?.name ? fieldSchema.name : 'Каталог'}
            </ReText>
          </Underline>
          {fieldSchema?.description ? <CatalogDescription text={fieldSchema.description} /> : null}
        </div>
        <CatalogMobileFilters />
      </div>
      <CatalogRootContainer>
        <CatalogTitleListContainer>
          <CatalogFiltersContainer>
            <CatalogPresets />
            <div className="flex w-full gap-2 max-sm:flex-col-reverse">
              <CatalogSearch className="w-full" />
              <CatalogOrdering />
            </div>
          </CatalogFiltersContainer>
          <CatalogList />
        </CatalogTitleListContainer>
        <CatalogDesktopFilters />
      </CatalogRootContainer>
    </CatalogRoot>
  );
};
