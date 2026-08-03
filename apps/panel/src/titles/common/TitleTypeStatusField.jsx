import { FunctionField } from 'react-admin';

import { Box } from '@mui/material';
import useTitleTypes from 'src/hooks/useTitleTypes.js';

const TitleTypeStatusField = (props) => {
    const { getNameById, isLoading } = useTitleTypes();

    if (isLoading) return null;

    return (
        <FunctionField
            {...props}
            render={(record) => (
                <Box display="flex" gap={0.5} flexDirection="column">
                    <span>{getNameById(record.type, 'types')}</span>
                    <span>{getNameById(record.status, 'status')}</span>
                </Box>
            )}
        />
    );
};

export default TitleTypeStatusField;
