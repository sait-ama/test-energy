import { createContext, useContext, useEffect,useState } from 'react';
import { useRecordContext } from 'react-admin';

const defaultState = {
    link: null,
    adminLink: null,
    moderLink: null,
};

export const LinkContext = createContext(defaultState);
export const LinkActionsContext = createContext(defaultState);

export const LinkContextProvider = ({ children }) => {
    const [links, setLinks] = useState(defaultState);

    return (
        <LinkContext.Provider value={{ links, setLinks }}>
            <LinkActionsContext.Provider value={setLinks}>{children}</LinkActionsContext.Provider>
        </LinkContext.Provider>
    );
};
export const useSetLinksAction = () => {
    return useContext(LinkActionsContext);
};
export const useLinkContext = () => {
    return useContext(LinkContext);
};
const defaultSelector = () => (v) => v;
export const useUpdateLinks = (selector = defaultSelector) => {
    const setLinks = useSetLinksAction();
    const record = useRecordContext();

    useEffect(() => {
        setLinks(selector(record));

        return () => {
            setLinks({});
        };
    }, [record]);
};
