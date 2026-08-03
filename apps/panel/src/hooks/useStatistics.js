import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

const useStatistics = (query = {}) => {
    const dataProvider = useDataProvider();

    return useQuery(['getStatistics', query], () => dataProvider['getStatistics'](query), {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
    });
};

export default useStatistics;
