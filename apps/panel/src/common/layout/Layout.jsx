import { Layout as RALayout } from 'react-admin';

import { Menu } from './Menu/index.js';
import { AppBar } from './AppBar';
import { LinkContextProvider } from './context';
export const Layout = (props) => (
    <LinkContextProvider>
        <RALayout {...props} appBar={AppBar} menu={Menu} />
    </LinkContextProvider>
);
