import { AdminContext, AdminUI, CustomRoutes, Resource } from 'react-admin';
import { BrowserRouter, Route } from 'react-router-dom';

import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from 'ra-language-russian';
import Statistics from 'src/statistics';

import authProvider from '../auth/authProvider.js';
import branches from '../branches';
import calls from '../calls';
import cards from '../cards';
import chapters from '../chapters';
import characters from '../characters';
import comments from '../comments';
import { Layout, LoginPage } from '../common/layout';
import creators from '../creators';
import dataProvider from '../dataProvider';
import feedbacks from '../feedbacks/index.js';
import { useCountRequests } from '../hooks/useUncheckedRequests.js';
import itemsRequests from '../items-requests';
import notifications from '../notifications';
import publishers from '../publishers';
import queueConfig from '../queue-config';
import reports from '../reports';
import requests from '../requests';
import titles from '../titles';
import users from '../users';

import { darkTheme } from './themes';

const i18nProvider = polyglotI18nProvider(() => russianMessages, 'ru');

const Resources = () => {
    const { data: counts, isLoading } = useCountRequests();

    if (isLoading) return null;

    return (
        <AdminUI layout={Layout} loginPage={LoginPage}>
            {counts.show_reports ? <Resource name="reports" {...reports} /> : null}

            {counts.show_requests ? <Resource name="requests" {...requests} /> : null}

            {counts.show_calls ? <Resource name="feedbacks" {...feedbacks} /> : null}
            <Resource name="moderator-requests" {...calls} />
            <Resource name="users" {...users} />
            <Resource name="publishers" {...publishers} />
            <Resource name="titles" {...titles} />
            <Resource name="chapters" {...chapters} />
            <Resource name="creators" {...creators} />
            <Resource name="characters" {...characters} />
            <Resource name="cards" {...cards} />
            <Resource name="comments" {...comments} />
            <Resource name="branches" {...branches} />
            <Resource name="items-requests" {...itemsRequests} />
            {counts.show_add_notifications ? <Resource name="notifications" {...notifications} /> : null}
            <Resource name="queue-config" {...queueConfig} />
            <CustomRoutes>
                <Route path="/statistics" element={<Statistics />} />
            </CustomRoutes>
        </AdminUI>
    );
};

export const AuthenticatedApp = () => {
    return (
        <BrowserRouter>
            <AdminContext
                theme={darkTheme}
                dataProvider={dataProvider}
                authProvider={authProvider}
                i18nProvider={i18nProvider}
                title="Модерка"
            >
                <Resources />
            </AdminContext>
        </BrowserRouter>
    );
};
