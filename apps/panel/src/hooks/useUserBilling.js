import { useDataProvider } from 'react-admin';
import { useQuery } from 'react-query';
export const useUserBilling = ({ userId, currency, page, count }) => {
    const dataProvider = useDataProvider();
    return useQuery('user_billing_' + userId, () => dataProvider.getUserBilling({ userId, currency, page, count }), {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        staleTime: 1000 * 60,
        enabled: !!userId,
    });
};
