import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';

const useMomentTagTypes = () => {
    const dataProvider = useDataProvider();
    
        const {
            data = {},
            isLoading,
            isFetching,
        } = useQuery('getMomentTagTypes', () => dataProvider['getMomentTagTypes'](), {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            staleTime: 1000 * 60,
        });
    
    
        return {
            list: data ?? [],
            isFetching,
            isLoading,
        };
};
export default useMomentTagTypes;
