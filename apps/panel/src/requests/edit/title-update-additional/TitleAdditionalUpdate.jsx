import { useRecordContext } from 'react-admin';

import { Box } from '@mui/material';

import { TextComparisonField } from '../../../common/fields/comparison/TextComparisonField.jsx';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestTitleAdditionalUpdate = () => {
    const record = useRecordContext();

    useTouchChangedFields();

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <TitleInfoField clickable source="title" />
            </Box>
            {Object.keys(record.data ?? {}).map((key) => (
                <TextComparisonField key={key} fieldName={key} prevBaseName="old_data" currentBaseName="data" />
            ))}
        </Box>
    );
};
