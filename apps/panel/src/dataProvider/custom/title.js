import { httpClient } from './../httpClient';

export const getTitleHistory = ({ id }) => {
    return httpClient(`/api/v2/panel/models/titles/${id}/update-history/`).then(({ json }) => json);
};

export const getTitleModel = ({ id }) => {
    return httpClient(`/api/v2/panel/models/titles/${id}/`).then(({ json }) => json);
};

