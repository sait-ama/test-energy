import { useRecordContext } from 'react-admin';

import { Typography } from '@mui/material';
import { typeToName } from 'src/requests/utils.js';

export const RequestTypeField = ({ source = 'type', ...rest }) => {
    const record = useRecordContext();
    if (!record) return null;

    const type = record[source];

    if (!type || !typeToName[type]) return null;

    return (
        <Typography variant="body2" {...rest}>
            {typeToName[type]}
        </Typography>
    );
};
