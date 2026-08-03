import type { ResponseResultsV2 } from '~shared/types/buisines';

export interface ToolkitApiOptions {
  cache?: globalThis.RequestInit['cache'];
  skipAuthorizationHeaders?: boolean;
  next?: globalThis.RequestInit['next'];
  responseTypeMethod?: 'blob' | 'json' | 'text';
  baseUrl?: string;
}

export interface ToolkitApiImpl {
  get: <T>(url: string, opts?: ToolkitApiOptions) => Promise<T>;
  post: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) => Promise<T>;
  put: <T, K>(url: string, data?: K, opts?: ToolkitApiOptions) => Promise<T>;
  delete: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) => Promise<T>;
  patch: <T, K>(url: string, data: K, opts?: ToolkitApiOptions) => Promise<T>;
}

export interface EndpointMeta<Params, Query> {
  params?: Params;
  query?: Query;
}

export type ToolkitEndpointBuilder<P, Q> = (meta: EndpointMeta<P, Q>) => string;
export type ToolkitMethod<R, P, Q> = EndpointMeta<P, Q> & { data?: R };
export type ToolkitMethodBuilder<RS, RQ, P, Q> = (
  variables: ToolkitMethod<RQ, P, Q>,
  opts?: ToolkitApiOptions
) => Promise<RS>;

interface ToolkitToolbox {
  createMethod<RS, RQ, P, Q>(
    func: ToolkitMethodBuilder<RS, RQ, P, Q>
  ): ToolkitMethodBuilder<RS, RQ, P, Q>;
}

interface ToolkitVariables {
  api: ToolkitApiImpl;
  toolbox: ToolkitToolbox;
}

const toolbox: ToolkitToolbox = {
  createMethod: <RS, RQ, P, Q>(func: ToolkitMethodBuilder<RS, RQ, P, Q>) => func,
};

export const apiToolkit =
  <E extends Record<string, ToolkitMethodBuilder<any, any, any, any>>>(
    fn: (variables: ToolkitVariables) => E
  ) =>
  (variables: Omit<ToolkitVariables, 'toolbox'>) =>
    fn({ ...variables, toolbox });

export const v1Serializer = <T extends V2Response<any, any>>(data: T) => {
  const { meta, ...other } = data;
  return {
    content: other,
    props: meta,
  };
};
export const v2Serializer = <T extends V1Response<any>>(data: T): ResponseResultsV2<any> => {
  if (data.content) {
    // @ts-ignore
    data.results = data.content;
  }
  if (data.props) {
    // @ts-ignore
    data.meta = data.props;
  }
  if (data.props) {
    // @ts-ignore
    delete data.props;
  }
  delete data.content;
  return data as ResponseResultsV2<any>;
};
