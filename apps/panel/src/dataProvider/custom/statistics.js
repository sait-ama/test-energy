import queryString from 'query-string';

import { httpClient } from './../httpClient';

// custom chartset
export const getStatistics = ({ method } = {}) =>
    httpClient(`/api/panel/stats/?${queryString.stringify({ method })}`, undefined, { pureResponse: true })
        .then((response) => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .catch(console.error);
