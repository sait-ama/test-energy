import { DefinedInitialDataOptions } from '@tanstack/react-query';

import { api } from '~shared/api/$api';
import type { FormSchema, Type } from '~shared/api/models/forms';
import { FormsTypes } from '~shared/api/models/forms';
import { UrlBuilder } from '~shared/utils/url-formatter';

export const getTypesBaseKey = <
  T extends FormsTypes,
  ExtendType extends Record<string, unknown> = {},
>(
  params: FormSchema<T>
) =>
  ({
    queryKey: ['forms', { params }],
    //@ts-ignore
    queryFn: () =>
      api
        .get<
          V1Response<Record<FormSchema<T>['get'][number], Type<ExtendType>[]>>
        >(new UrlBuilder(`/api/forms/${params.type}/`).query({ get: params.get }).build())
        .then((v) =>
          params.type === FormsTypes.FRIENDS
            ? { content: { statuses: v.content as unknown as Type[] } }
            : v
        ),
  }) as unknown as DefinedInitialDataOptions<
    V1Response<Record<FormSchema<T>['get'][number], Type<ExtendType>[]>>
  >;
