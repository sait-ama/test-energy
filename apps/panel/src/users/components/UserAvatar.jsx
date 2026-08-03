import { useRecordContext } from 'react-admin';

import { Avatar } from '@mui/material';

const UserAvatar = ({ size = 24 }) => {
    const record = useRecordContext();
    if (!record) return null;
    return <Avatar src={record.avatar} sx={{ width: size, height: size }} />;
};

export default UserAvatar;
