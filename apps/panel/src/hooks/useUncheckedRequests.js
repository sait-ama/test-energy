import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

export const useCountRequests = () => {
    const dataProvider = useDataProvider();

    const { data, isLoading } = useQuery('unchecked_requests', () => dataProvider.getInfo(), {
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60,
    });

    return { data: data ?? {}, isLoading }
};

export const useUncheckedRequests = (requestName) => {
    const { data } = useCountRequests()

    return data ? data['count_' + requestName] ?? 0 : 0;
};
