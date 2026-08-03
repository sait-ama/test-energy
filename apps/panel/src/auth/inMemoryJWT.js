import Cookie from 'cookie-universal';

const getStoredToken = () => {
    const cookies = Cookie();
    return cookies.get('token');
};

const setTokenCookie = (token) => {
    const cookies = Cookie();
    cookies.set('token', token);
};

const removeTokenCookie = () => {
    const cookies = Cookie();
    cookies.remove('token');
};

const inMemoryJWTManager = () => {
    let logoutEventName = 'ra-logout';
    let refreshEndpoint = '/api/token/refresh';
    let inMemoryJWT = getStoredToken();
    let refreshTimeOutId;
    let isRefreshing = null;

    // This listener allows to disconnect another session of react-admin started in another tab
    window.addEventListener('storage', (event) => {
        if (event.key === logoutEventName) {
            inMemoryJWT = null;
        }
    });

    window.addEventListener('storage', (event) => {
        if (event.key === 'token') {
            inMemoryJWT = event.newValue;
        }
    });

    const isExpired = () => {
        return false; // && jwtDecode(inMemoryJWT).exp < new Date().getTime()/1000;
    };

    const getExpirationTime = () => {
        return 999999999999999; // REMOVE when token will have exp time
        // return jwtDecode(token).exp - new Date().getTime()/1000;
    };

    const setRefreshTokenEndpoint = (endpoint) => (refreshEndpoint = endpoint);

    // This countdown feature is used to renew the JWT in a way that is transparent to the user.
    // before it's no longer valid
    const refreshToken = () => {
        // placeholder !!! !important
        //    refreshTimeOutId = window.setTimeout(
        //        getRefreshedToken,
        //         delay * 1000 - 5000
        //    ); // Validity period of the token in seconds, minus 5 seconds
    };

    const abordRefreshToken = () => {
        if (refreshTimeOutId) {
            window.clearTimeout(refreshTimeOutId);
        }
    };

    const waitForTokenRefresh = () => {
        if (!isRefreshing) {
            return Promise.resolve();
        }
        return isRefreshing.then(() => {
            isRefreshing = null;
            return true;
        });
    };

    // The method makes a call to the refresh-token endpoint
    // If there is a valid cookie, the endpoint will return a fresh jwt.
    const getRefreshedToken = async () => {
        const request = new Request(refreshEndpoint, {
            method: 'GET',
            headers: new Headers({
                Accept: 'application/json',
                Authorization: `Bearer ${inMemoryJWT}`,
            }),
        });

        isRefreshing = fetch(request)
            .then((response) => {
                if (response.status !== 200) {
                    ereaseToken();
                    console.log('Token renewal failure');
                    return { token: null };
                }
                return response.json();
            })
            .then(({ content: { token } = {} }) => {
                if (token) {
                    setToken(token);
                    setTokenCookie(token);
                    refreshToken(getExpirationTime(token));
                    return true;
                }
                console.log('JWT refresh error');
                return false;
            })
            .catch(() => {
                removeTokenCookie();
                return false;
            });

        return isRefreshing;
    };

    const getToken = () => {
        return inMemoryJWT;
    };

    const setToken = (token) => {
        setTokenCookie(token);
        refreshToken(getExpirationTime(token));
        inMemoryJWT = token;
        return true;
    };

    const ereaseToken = () => {
        removeTokenCookie();
        inMemoryJWT = null;
        return true;
    };

    if (inMemoryJWT) {
        if (isExpired()) {
            console.log('JWT refresh');
            getRefreshedToken().then(() => {
                console.log('JWT refresh success');
            });
        } else {
            refreshToken(getExpirationTime(inMemoryJWT));
        }
    }

    return {
        setRefreshTokenEndpoint,
        getRefreshedToken,
        abordRefreshToken,
        waitForTokenRefresh,
        refreshToken,
        ereaseToken,
        getToken,
        setToken,
    };
};

export default inMemoryJWTManager();
