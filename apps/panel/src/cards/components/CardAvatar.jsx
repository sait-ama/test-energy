import { useRecordContext } from 'react-admin';

import { Avatar } from '@mui/material';
import { getFullUrl } from 'src/utils/getFullUrl';

const CardAvatar = ({ size = 24, record: recordProp }) => {
    const recordContextValue = useRecordContext();
    const record = recordProp || recordContextValue;

    if (!record) return null;

    const src = record.cover?.mid ?? '';

    return (
        <Avatar
            src={getFullUrl(src)}
            sx={{ width: size, height: size * 1.5, borderRadius: '6% / 4%', bgcolor: 'background.accent' }}
        />
    );
};

export default CardAvatar;
