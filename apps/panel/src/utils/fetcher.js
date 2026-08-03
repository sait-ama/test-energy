import Cookie from 'cookie-universal';

export function requestOptions(method = 'GET', headers, body) {
    return {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : null,
    };
}

export function authHeader() {
    const cookies = Cookie();
    const { token } = cookies.get('token');
    let header = {};
    if (token) header.authorization = `Bearer ${token}`;
    return header;
}

export const _fetch = async (url, method, headers, body) => {
    const fullUrl = url;

    return fetch(fullUrl, requestOptions(method, headers, body))
        .then((response) => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json().then((json) => ({ json, response }));
            } else {
                return response.text().then((json) => ({ json, response }));
            }
        })
        .then(({ json, response }) => {
            if (!response.ok) {
                let error = new Error(response.status);
                if (typeof json == 'string') {
                    error.html = json;
                } else {
                    error.name = json.msg;
                    error.msg = json.msg;
                    error.content = json.content;
                    error.props = json.props;
                }
                error.status = response.status;
                throw error;
            }
            return json;
        });
};

const serializeError = (error) => ({ error, content: error.content });
// with error catch - use for isomorphic (aka getInitialProps) fetches,
// when you dont need to throw errors
const fetchCatch = async (url, ctx) => _fetch(url, 'GET', authHeader(ctx)).catch(serializeError);
//else - use fetcher to valid error catching while using useSWR
const fetcher = async (url, ctx) => _fetch(url, 'GET', authHeader(ctx));

const PUT = async (url, body, ctx) => _fetch(url, 'PUT', authHeader(ctx), body).catch(serializeError);

const POST = async (url, body, ctx) => _fetch(url, 'POST', authHeader(ctx), body).catch(serializeError);

const DELETE = async (url, body, ctx) => _fetch(url, 'DELETE', authHeader(ctx), body).catch(serializeError);

export { DELETE, fetchCatch as fetch,fetcher, POST, PUT };

export default fetcher;
