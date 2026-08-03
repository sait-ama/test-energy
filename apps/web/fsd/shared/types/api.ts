declare global {
  interface StringError {
    message: string;
    type: string;
  }

  interface BackendValidationError {
    statusCode: number;
    detail: Record<string, string>;
  }

  type V2Response<
    TData extends Record<string, unknown>,
    TMeta extends Record<string, unknown> = never,
  > = {
    meta: TMeta;
  } & TData;

  interface V1Response<Content, Props = Record<string, unknown>> {
    content: Content;
    props: Props;
  }

  interface V2ListResponse<T> {
    count?: number;
    next?: string;
    previous?: string;
    results: T[];
  }
}

export {};
