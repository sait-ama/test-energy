import { ReactNode, Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { getCharacterKey } from '~entities/character/model/queries';
import { getCreatorKey } from '~entities/creator/model/queries';
import { getHeroCardSuspenseQuery } from '~entities/inventory/model/queries';
import { getPublisherQuery } from '~entities/publisher/model/queries';
import { getTitleDetailKey } from '~entities/title/model/queries';
import { getUserQueryKey } from '~entities/user/model/queries';
import { SearchField as SearchFieldEnum, SearchItem } from '~shared/api/models/search';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { exhaustiveCheck } from '~shared/utils/exhaustive-check';

const createQueryOptions = (field: SearchFieldEnum, id: number | string | null) => {
  if (id == null) return null;

  switch (field) {
    case SearchFieldEnum.cards:
      return getHeroCardSuspenseQuery({
        variables: {
          params: {
            cardId: id,
          },
        },
      });
      break;
    case SearchFieldEnum.creators:
      return getCreatorKey({
        variables: {
          params: {
            id,
          },
        },
      });
    case SearchFieldEnum.characters:
      return getCharacterKey({
        variables: {
          params: {
            characterId: id,
          },
        },
      });
    case SearchFieldEnum.titles:
      return getTitleDetailKey({
        variables: {
          params: {
            dir: String(id),
          },
        },
      });
    case SearchFieldEnum.users:
      return getUserQueryKey({
        variables: {
          params: {
            userId: id,
          },
        },
      });
    case SearchFieldEnum.publishers:
      return getPublisherQuery({
        variables: {
          params: {
            dir: String(id),
          },
        },
      });
    default:
      exhaustiveCheck(field);
      return null;
  }
};

export interface SingleSearchEntityProviderProps<TField extends SearchFieldEnum> {
  defaultValue: number | string | null;
  field: TField;
  children: (opts: { data: SearchItem<TField> | null }) => ReactNode;
}

export const SingleSearchEntityProvider = <TField extends SearchFieldEnum>(
  props: SingleSearchEntityProviderProps<TField>
) => {
  const { defaultValue, field, children } = props;

  const queryOptionsStatic = useMemo(() => createQueryOptions(field, defaultValue), []);

  if (!queryOptionsStatic) return children({ data: null });

  return (
    <Suspense fallback={null}>
      <ErrorBoundary fallbackRender={() => children({ data: null })}>
        <ContentSuspenseQuery
          queryOptions={{
            ...queryOptionsStatic,
          }}
        >
          {children}
        </ContentSuspenseQuery>
      </ErrorBoundary>
    </Suspense>
  );
};
