import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

const useTitleModel = (query = {}) => {
    const dataProvider = useDataProvider();

    return useQuery(['getTitleModel', query], () => dataProvider['getTitleModel'](query), {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        enabled: !!query.id,
    });
};

export default useTitleModel;
