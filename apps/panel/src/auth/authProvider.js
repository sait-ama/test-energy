import Cookie from 'cookie-universal';

import inMemoryJWT from './inMemoryJWT.js';

function storeAuthentication({ access_token: token, ...user } = {}) {
    token && inMemoryJWT.setToken(token);
    const cookies = Cookie();
    cookies.set('user', user);
}

const removeAuthentication = () => {
    inMemoryJWT.ereaseToken();
    const cookies = Cookie();
    cookies.remove('user');
};

function handleResponse(response) {
    if (response?.status < 200 || response?.status >= 300) {
        // throw new Error(response.statusText);
    }
    return response.json();
}

const authProvider = {
    login: ({ user, ...rest }) => {
        const request = new Request('/api/users/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user,
                ...rest,
            }),
        });

        return fetch(request)
            .then(handleResponse)
            .then(({ content }) => {
                storeAuthentication(content);
                //    config.firstTime = false;
                return content;
            })
            .catch((error) => {
                if (error.message === 'Failed to fetch' || error.stack === 'TypeError: Failed to fetch') {
                    throw new Error('errors.network_error');
                }

                throw new Error(error);
            });
    },

    logout: async () => {
        inMemoryJWT.ereaseToken();
        //  stopEventStream()
        removeAuthentication();
        return Promise.resolve();
    },

    checkAuth: () => {
        return inMemoryJWT.waitForTokenRefresh().then(() => {
            return inMemoryJWT.getToken() ? Promise.resolve() : Promise.reject();
        });
    },

    checkError: ({ status } = {}) => {
        if (status === 401 || status === 403) {
            removeAuthentication();
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getPermissions: () => {
        return inMemoryJWT.waitForTokenRefresh().then(() => {
            if (inMemoryJWT.getToken()) {
                //here place to roles logic
                const cookies = Cookie();
                const user = cookies.get('user');
                const roles = [...(user.is_staff ? ['staff'] : []), ...(user.is_superadmin ? ['admin'] : [])];
                return roles.length ? Promise.resolve(roles) : Promise.reject();
            }
            return Promise.reject();
        });
    },

    getIdentity: () => {
        const cookies = Cookie();
        const user = cookies.get('user');
        return user;
    },
};

export default authProvider;
