import { httpClient } from './../httpClient';

export const getInfo = () => {
    return httpClient(`/api/v2/panel/info/`).then(({ json }) => json);
};
