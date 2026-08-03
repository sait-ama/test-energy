import { HttpError } from 'react-admin';

import inMemoryJWT from '../auth/inMemoryJWT.js';

// export const httpClient = (url, options = {}) => {
//     if (!options.headers) {
//         options.headers = new Headers({ Accept: 'application/json' });
//     }
//     options.headers.set('authorization', `bearer ${inMemoryJWT.getToken()}`);
//     return fetchUtils.fetchJson(url, options);
// };

export const createHeadersFromOptions = (options) => {
    const requestHeaders =
        options.headers ||
        new Headers({
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'same-site',
        });

    if (
        !requestHeaders.has('Content-Type') &&
        !(options && (!options.method || options.method === 'GET')) &&
        !(options && options.body && options.body instanceof FormData)
    ) {
        requestHeaders.set('Content-Type', 'application/json');
    }
    if (options.user && options.user.authenticated && options.user.token) {
        requestHeaders.set('Authorization', options.user.token);
    }
    const token = inMemoryJWT.getToken();
    if (token) {
        requestHeaders.set('authorization', `bearer ${inMemoryJWT.getToken()}`);
    }

    return requestHeaders;
};

export const httpClient = async (url, options = {}, _options = {}) => {

    const requestHeaders = createHeadersFromOptions(options);
    const response = fetch(url, { ...options, headers: requestHeaders });

    if (_options.pureResponse) return response;

    return response.then(
        (response) =>
            response.text().then((text) => ({
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                body: text,
            })),
    )
    .then(
        ({ status, statusText, headers, body}) => {
            let json;

            try {
                json = JSON.parse(body);
            } catch (e) {
                // not json, no big deal
            }
            if (status < 200 || status >= 300) {
                return Promise.reject(new HttpError(json?.msg || statusText, status, json));
            }
            return Promise.resolve({ status, headers, body, json });
        },
    );
};
