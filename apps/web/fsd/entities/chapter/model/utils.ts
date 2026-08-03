import { ErrorTransformer } from '~shared/api/$api';
import { logger } from '~shared/lib/logger';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

//todo
export interface XhrOptions<ResponseSchema = any> {
  method: string;
  url: string;
  data?: Document | XMLHttpRequestBodyInit | null | undefined;
  headers?: any;
  options?: {
    onProgress?: (progress: number | null) => void;
    onSuccess?: (response: ResponseSchema) => void;
    onError?: (e: BackendValidationError) => void;
  };
}

export const xhr = <ResponseSchema = any>(_options: XhrOptions<ResponseSchema>) =>
  new Promise((resolve, reject) => {
    const { method, url, data, options = {} } = _options;
    const { onProgress, onError, onSuccess } = options;

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      const percentage = Math.ceil((event.loaded / event.total) * 100);
      onProgress?.(percentage);
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 400) {
        try {
          const response = JSON.parse(xhr.response);
          const error = ErrorTransformer.JSON({ data: response, status: xhr.status });
          onError?.(error);
          reject(error);
        } catch (e) {
          logger.error(e);
          const error = ErrorTransformer.DEFAULT({ content: xhr.response, status: xhr.status });
          onError?.(error);
          reject(error);
        }

        return;
      }

      let data;

      try {
        data = JSON.parse(xhr.response);
        // eslint-disable-next-line handle-errors/log-error-in-trycatch
      } catch {
        data = null;
      }

      onSuccess?.(data);
      resolve(data);
      onProgress?.(null);
    };

    xhr.open(method, UrlFormatter.createUrl(publicEnv('GATEWAY_URL'), url), true);

    const token = CookieService.get('token');

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(data);
  });
