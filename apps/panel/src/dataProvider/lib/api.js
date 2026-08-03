import queryString from 'query-string';

export const apiResourceVersions = {
    notes: 2,
    requests: 2,
    titles: 2,
    publishers: 2,
    users: 2,
    genres: 2,
    categories: 2,
    reports: 2,
    'title-updates': 2,
    strikes: 2,
    creators: 2,
    comments: 2,
    cards: 2,
    characters: 2,
    branches: 2,
    additional: 2,
    'moderator-requests': 2,
    notifications: 2,
    bans: 2,
    chapters: 2,
    'payments-money': 2,
    'payments-tickets': 2,
    tickets: 2,
    user_buy: 2,
    feedbacks: 2,
    'inventory-cards': 2,
    'card-upgrades': 2,
    'items-requests': 2,
    promotions: 2,
    'queue-config': 2,
    'publisher-invitations': 2,
};

export const apiResourceNames = {
    creators: 'models/creators',
    titles: 'models/titles',
    publishers: 'models/publishers',
    users: 'models/users',
    genres: 'models/genres',
    categories: 'models/categories',
    'title-updates': 'models/titles',
    comments: 'models/comments',
    cards: 'models/cards',
    chapters: 'models/chapters',
    characters: 'models/characters',
    strikes: 'strikes',
    branches: 'models/branches',
    additional: 'models/titles',
    'payments-money': 'models/payments/user',
    'payments-tickets': 'models/payments/user',
    user_buy: 'models/user_buy',
    tickets: 'tickets',
    notifications: 'models/user-notifications',
    'inventory-cards': 'models/inventory-cards',
    'card-upgrades': 'models/users',
    promotions: 'models/promotions',
    'queue-config': 'requests/config',
    'publisher-invitations': 'models/publisher_invitations',
};

export const nonPanelResourceNames = {
    // comments: true,
    'forms/publishers': true,
};

export const postfixResourceNames = {
    'title-updates': 'update-history',
    additional: 'additional',
    'card-upgrades': 'upgrades',
    'payments-money': 'money',
    'payments-tickets': 'tickets',
};

const withVersion = (resource) => {
    if (apiResourceVersions[resource]) {
        return [`v${apiResourceVersions[resource]}`];
    }
    return [];
};

const withCustomRouteName = (resource) => {
    if (apiResourceNames[resource]) {
        return [apiResourceNames[resource]];
    }
    return [resource];
};

const withPostfix = (resource) => {
    if (postfixResourceNames[resource]) {
        return [postfixResourceNames[resource]];
    }

    return [];
};

const withPanelRouteName = (resource) => {
    if (nonPanelResourceNames[resource]) {
        return [];
    }

    return ['panel'];
};

export const getResourceApiUrl = ({ resource, id, query }) => {
    const q = queryString.stringify(query).replaceAll('%21=', '!=');

    return (
        [
            '/api',
            ...withVersion(resource),
            ...withPanelRouteName(resource),
            ...withCustomRouteName(resource),
            id,
            ...withPostfix(resource),
        ]
            .filter(Boolean)
            .join('/') +
        '/' +
        (q ? `?${q}` : '')
    );
};
