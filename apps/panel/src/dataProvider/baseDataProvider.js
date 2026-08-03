import { pick } from 'lodash';

import { apiResourceVersions, getResourceApiUrl } from './lib/api';
import { httpClient } from './httpClient';

const baseDataProvider = {
    getList: (resource, params) => {
        const orderings = params.sort.order.split(',');
        const fields = params.sort.field.split(',');

        const query = {
            ...params.filter,
            ...(params.sort.field
                ? {
                      ordering: fields.map((field, index) => {
                          const order = orderings[index] || 'ASC';
                          return (order === 'DESC' ? '-' : '') + field;
                      }),
                  }
                : {}),
            count: params.pagination.perPage,
            page: params.pagination.page,
        };

        const apiVersion = apiResourceVersions[resource];

        const url = getResourceApiUrl({ resource, query });

        return httpClient(url).then(({ json }) => {
            if (apiVersion === 2) {
                return {
                    data: json.results,
                    total: json.count,
                };
            }

            return {
                data: json.content,
                total: json.props?.total_items ?? json.content?.length,
            };
        });
    },

    getOne: (resource, params) => {
        const url = getResourceApiUrl({ resource, id: params.id });
        const apiVersion = apiResourceVersions[resource];

        return httpClient(url).then(({ json }) =>
            apiVersion === 2
                ? {
                      data: json,
                  }
                : {
                      data: {
                          ...json.content,
                          id: json.content.id,
                      },
                  },
        );
    },

    getMany: (resource, params) => {
        const query = { id: params.ids.map((it) => (typeof it === 'object' ? (it?.['id'] ?? it) : it)) };

        const apiVersion = apiResourceVersions[resource];

        console.log('getMany', resource, params);

        const url = getResourceApiUrl({ resource, query });

        return httpClient(url).then(({ json }) =>
            apiVersion === 2 ? { data: json.results, total: json.count } : { data: json.content },
        );
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { meta = {}, ...filters } = params.filter;

        console.log('many reference', resource, params);
        const apiVersion = apiResourceVersions[resource];

        if (!params.id.length && meta.requireParam) {
            return Promise.resolve({ data: [], total: 0 });
        }

        const query = {
            count: perPage,
            page: page,
            ...(params.sort.field
                ? {
                      ordering: params.sort.field.includes(',')
                          ? params.sort.field.split(',').map((field) => {
                                const [fieldName, order] = field.split(':');
                                return (order === 'DESC' ? '-' : '') + fieldName;
                            })
                          : [(params.sort.order === 'DESC' ? '-' : '') + params.sort.field],
                  }
                : {}),
            ...filters,
        };

        if (!meta.idAsPath) {
            query[params.target] = params.id;
        }

        const url = getResourceApiUrl({
            resource,
            query,
            id: meta.idAsPath ? params.id : null,
        });

        return httpClient(url).then(({ json }) => {
            // todo: 'meta' field
            const { metaFields } = meta;

            if (apiVersion === 2) {
                return {
                    data: !metaFields
                        ? json.results
                        : json.results?.map((v) => ({ ...v, __meta: pick(json, metaFields) })),
                    total: json.count,
                };
            }

            return {
                data: json.content,
                total: json.props?.total_items || json.content.length,
            };
        });
    },

    update: (resource, params) => {
        const apiVersion = apiResourceVersions[resource];
        const url = getResourceApiUrl({ resource, id: params.id });

        const { is_patch, ...body } = params.data;

        return httpClient(url, {
            method: is_patch ? 'PATCH' : 'PUT',
            body: JSON.stringify(body),
        }).then(({ json }) => {
            return apiVersion === 2
                ? { data: { ...json, id: json?.id || params.id } }
                : {
                      data: {
                          ...(json?.content ?? {}),
                          id: json?.content?.id || params.id,
                      },
                  };
        });
    },

    updateMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };

        const apiVersion = apiResourceVersions[resource];
        const url = getResourceApiUrl({ resource, query });

        return httpClient(url, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => (apiVersion === 2 ? { data: json } : { data: json.content }));
    },

    create: (resource, params) => {
        const apiVersion = apiResourceVersions[resource];
        const url = getResourceApiUrl({ resource });

        return httpClient(url, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json: _json }) => {
            const json = _json ?? {};

            return apiVersion === 2
                ? { data: { ...params.data, ...json, id: json.id } }
                : {
                      data: {
                          ...params.data,
                          ...json.content,
                          id: json.content.id,
                      },
                  };
        });
    },

    delete: (resource, params) => {
        const apiVersion = apiResourceVersions[resource];
        const url = getResourceApiUrl({ resource, id: params.id });

        return httpClient(url, {
            method: 'DELETE',
            body: JSON.stringify(params.meta),
        }).then(({ json }) => (apiVersion === 2 ? { data: json } : { data: json.content }));
    },

    deleteMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };

        const apiVersion = apiResourceVersions[resource];
        const url = getResourceApiUrl({ resource, query });

        return httpClient(url, {
            method: 'DELETE',
            body: JSON.stringify(params.data),
        }).then(({ json }) => (apiVersion === 2 ? { data: json } : { data: json.content }));
    },
};

export default baseDataProvider;
