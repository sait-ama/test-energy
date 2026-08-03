import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

const usePrivileges = () => {
    const dataProvider = useDataProvider();
    const { data = {}, isFetching } = useQuery('privileges', () => dataProvider.getPrivileges(), {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60,
    });

    const getNameById = (id, field) => {
        if (!id) return '';
        const p = data.content?.[field]?.find((privilege) => privilege.id === id);
        return p ? p.name : '';
    };

    return {
        list: data.content?.privileges || [],
        getNameById,
        isFetching,
    };
};

export default usePrivileges;
