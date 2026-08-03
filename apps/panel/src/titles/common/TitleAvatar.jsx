import { useRecordContext } from 'react-admin';

import { Avatar } from '@mui/material';

import { getFullUrl } from '../../utils/getFullUrl.js';

const TitleAvatar = ({ width = 64, record: recordProp }) => {
    const recordContextValue = useRecordContext('title.cover');
    const record = recordProp || recordContextValue;

    return (
        <Avatar src={getFullUrl(record?.cover?.mid)} sx={{ width: width, height: width * 1.5, borderRadius: '8px' }} />
    );
};

export default TitleAvatar;
