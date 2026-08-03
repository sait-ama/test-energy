export class ResourceLoadError extends Error {}

export class NetworkError extends Error {}
export class InternalFetchError extends Error {}

export class PermissionError extends Error {}
export class ManuallyError extends Error {
  readonly statusCode: BackendValidationError['statusCode'];
  readonly message: string;
  constructor(message: string, statusCode: number) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}
export class AuthError extends ManuallyError {
  constructor(message?: string) {
    super(message ?? 'Требуется авторизация', 401);
  }
}

export class ApiError extends Error {
  readonly data: BackendValidationError;

  constructor(data: BackendValidationError, options?: ErrorOptions) {
    super(JSON.stringify(data), options);
    this.name = 'API Error';
    this.data = data;
  }
}

export class InErrorBoundaryException extends Error {}
