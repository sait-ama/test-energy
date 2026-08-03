import { useRecordContext } from 'react-admin';

import { Box } from '@mui/material';

import { CustomTextInput } from '../../../common/fields/TextInput.jsx';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestTitleAdditionalAdd = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <Box>
            <TitleInfoField source="title" clickable />
            <Box sx={{ my: 2 }}>
                {Object.keys(record.data ?? {}).map((key) => (
                    <CustomTextInput name={`data.${key}`} source={`data.${key}`} />
                ))}
            </Box>
        </Box>
    );
};
