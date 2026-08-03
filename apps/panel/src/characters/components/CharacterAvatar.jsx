import { useRecordContext } from 'react-admin';

import { Avatar } from '@mui/material';

import { getFullUrl } from '../../utils/getFullUrl.js';

const CharacterAvatar = ({ size = 24 }) => {
    const record = useRecordContext();

    if (!record) return null;

    return <Avatar src={getFullUrl(record.cover?.mid)} sx={{ width: size, height: size }} />;
};

export default CharacterAvatar;
