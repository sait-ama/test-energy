import { httpClient } from './../httpClient';

export const getPrivileges = () => {
    return httpClient(`/api/forms/publishers/?get=scanlate_types&get=privilege&get=rights`).then(
        ({ json }) => json,
    );
};

export const getTitleTypes = () => {
    return httpClient(
        '/api/forms/titles/?get=genres&get=categories&get=types&get=status&get=age_limit&get=authors&get=publishers&get=relations&get=translate_status',
    ).then(({ json }) => json);
};

export const getPublisherTypes = () => {
    return httpClient(
        '/api/forms/publishers/?get=type&get=restrictions&get=privileges&get=rights&get=monetization',
    ).then(({ json }) => json);
};

export const getCreatorTypes = () => {
    return httpClient('/api/forms/creators/?get=country&get=type').then(({ json }) => json);
};

export const getRankTypes = () => {
    return httpClient('/api/forms/cards/?get=ranks').then(({ json }) => json);
};

export const getUserTypes = () => {
    return httpClient('/api/forms/users/?get=shop_items').then(({ json }) => json);
};

export const getPaymentsTypes = () => {
    return httpClient('/api/forms/payments/?get=status&get=type&get=provider').then(({ json }) => json);
};

export const getReportsTypes = () => {
    return httpClient('/api/forms/panel/?get=reports').then(({ json }) => json);
}

export const getMomentTagTypes = () => {
    return httpClient('/api/v2/titles/moments/tags/').then(({ json }) => json);
}
