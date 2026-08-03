import { useRecordContext } from 'react-admin';

import { Avatar } from '@mui/material';

const CreatorAvatar = ({ size = 24 }) => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Avatar
            src={record.cover ? import.meta.env.VITE_API_URL + record.cover?.mid : null}
            sx={{ width: size, height: size, borderRadius: '6px' }}
        />
    );
};

export default CreatorAvatar;
