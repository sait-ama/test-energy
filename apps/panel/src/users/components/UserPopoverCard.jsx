import { Link, useRecordContext } from 'react-admin';

import { Box } from '@mui/material';
import UserInfoField from 'src/users/components/UserInfoField.jsx';
import { UserPublishersList } from 'src/users/components/UserPublishers.jsx';

export const UserPopoverCard = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <Link to={`/users/${record.id}/show`} sx={{ cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
            <Box p={2}>
                <UserInfoField />
                <UserPublishersList />
            </Box>
        </Link>
    );
};
