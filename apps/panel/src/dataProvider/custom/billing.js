import { httpClient } from './../httpClient';

export const getUserBilling = ({ userId, currency, page, count = 50 }) => {
    return httpClient(`/api/users/${userId}/payments/?currency=${currency}&page=${page}&count=${count}`).then(
        ({ json }) => json,
    );
};
