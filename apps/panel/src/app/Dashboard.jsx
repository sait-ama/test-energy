import { useGetIdentity } from 'react-admin';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

export const Dashboard = () => {
    const { data: user } = useGetIdentity();

    return (
        <Card sx={{ mt: 3 }}>
            <CardHeader title={`Добро пожаловать в модерку, ${user && user.username}!`} />
        </Card>
    );
};
