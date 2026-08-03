export {};

export interface Error {
  msg: string;
  status: number;
  html?: string;
}

export interface PaginationQuerySchema {
  count: number;
  page: number;
}

export interface MinimalPaginationResponse {
  next: string | null;
  previous: string | null;
}

export interface PaginationResponse extends MinimalPaginationResponse {
  count: number;
}

export interface Res<T, K = Record<string, unknown>, E = Error> {
  content: T;
  msg: string;
  props: K;
  error: E;
}

export type ResponseV2Single<ResultType, PropsType = Record<string, unknown>, ErrorType = Error> = {
  msg?: string;
  props: PropsType;
  error?: ErrorType;
} & ResultType;
export type ResponseResultsV2<
  ResultType,
  PropsType = Record<string, unknown>,
  ErrorType = Error,
> = Omit<ResponseV2Single<ResultType, PropsType, ErrorType>, 'props' | 'content'> & {
  meta: PropsType;
  results: ResultType;
};

export interface ResponseResults<ItemType, PropsType = Record<string, unknown>, ErrorType = Error>
  extends ResponseV2Single<{ results: ItemType }, PropsType, ErrorType>,
    PaginationResponse {}

export enum imgSizes {
  'high' = 'high',
  'mid' = 'mid',
  'low' = 'low',
}

declare global {
  export type NumberIsomorphic = string | number;
  export type NumberIsomorphicV2 = `${number}` | number;
  export type QueryPrimitive = NumberIsomorphic | string;
}

// Обертка для типа в форме: трансформирует текущую модель с диктом в строку
export type UpdateImageTransformer<T> = {
  [K in keyof T]: K extends 'wallpaper' | 'frame' | 'avatar' | 'image' | 'cover' ? string : T[K];
};
export type Bit = 0 | 1;
export type BitIsomorphic = `${Bit}` | Bit;
export type LogicalBinaryType = Bit | boolean;
export type LogicalBinaryTypeIsomorphic = Bit | boolean | BitIsomorphic;
