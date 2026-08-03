'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import {
  CatalogDesktopFilters,
  CatalogFiltersContainer,
  CatalogList,
  CatalogMobileFilters,
  CatalogOrdering,
  CatalogRoot,
  CatalogRootContainer,
  CatalogSearch,
  CatalogTitleListContainer,
} from '~widgets/catalog/ui/catalog';

export const PublisherTitles = () => {
  const { dir } = useParams<{ dir: string }>();
  const { data } = usePublisherQuery({
    variables: {
      params: {
        dir,
      },
    },
  });

  return (
    <CatalogRoot overrides={{ publishers: [String(data!.content.id)] }}>
      <div className="flex justify-end">
        <CatalogMobileFilters />
      </div>
      <CatalogRootContainer>
        <CatalogTitleListContainer>
          <CatalogFiltersContainer>
            <CatalogOrdering />
            <CatalogSearch />
          </CatalogFiltersContainer>
          <CatalogList />
        </CatalogTitleListContainer>
        <CatalogDesktopFilters />
      </CatalogRootContainer>
    </CatalogRoot>
  );
};
