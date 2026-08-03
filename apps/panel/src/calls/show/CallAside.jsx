import { useRecordContext } from 'react-admin';

import { Box, Typography } from '@mui/material';

import { NotesIterator } from '../../notes/index.js';

const RequestAside = () => {
    const record = useRecordContext();

    if (!record) {
        return null;
    }

    return (
        <Box ml={4} mr={2} width={300} minWidth={250}>
            <Typography variant="subtitle" paragraph sx={{ fontWeight: 'bold' }}>
                Заметки
            </Typography>

            <NotesIterator reference="moderator_request" target={record.id} />
        </Box>
    );
};

export default RequestAside;
