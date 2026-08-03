import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import Cookie from 'cookie-universal';

import { AuthenticatedApp } from './AuthencticatedApp';
// import { NotFound } from 'ra-ui-materialui';

const applyDevUser = () => {
    if (import.meta.env.DEV) {
        const cookies = Cookie();
        // cookies.set('user', { is_staff: true, username: 'Test moder' });
        // cookies.set('token', '1');
        return true;
    }
    return false;
};

function checkPermissions() {
    const cookies = Cookie();

    const user = cookies.get('user');
    return user ? user.is_staff : applyDevUser();
}

const queryClient = new QueryClient();

const App = () => {
    const hasAccess = checkPermissions();

    // if (!hasAccess) return <NotFound />;

    return (
        <QueryClientProvider client={queryClient}>
            <AuthenticatedApp />
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
    );
};

export default App;
