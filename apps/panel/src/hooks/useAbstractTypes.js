import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

const useAbstractTypes = (source) => {
    const dataProvider = useDataProvider();

    const {
        data = {},
        isLoading,
        isFetching,
    } = useQuery(source, () => dataProvider[source](), {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60,
    });

    const getNameById = (id, by) => {
        if (!id) return '';
        const p = data.content[by]?.find((type) => type.id === id);
        return p ? p.name : '';
    };

    return {
        list: data.content ?? {},
        getNameById,
        isFetching,
        isLoading,
    };
};

export default useAbstractTypes;
