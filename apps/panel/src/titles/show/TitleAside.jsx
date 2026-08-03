import { useRecordContext } from 'react-admin';

import { Box, Typography } from '@mui/material';

import { NotesIterator } from '../../notes';

const TitleAside = () => {
    const record = useRecordContext();

    if (!record) {
        return null;
    }

    return (
        <Box ml={4} mr={2} width={300} minWidth={250} maxWidth={250}>
            <Typography variant="subtitle" paragraph sx={{ fontWeight: 'bold' }}>
                Заметки
            </Typography>

            <NotesIterator reference="title" target={record.id} />
        </Box>
    );
};

export default TitleAside;
