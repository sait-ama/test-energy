import { Edit, required, ShowButton,SimpleForm, TextInput } from 'react-admin';

import { Box } from '@mui/material';
import { CustomRichTextInput } from 'src/common/fields/RichTextInput.jsx';

const CreatorEdit = () => (
    <Edit actions={() => null}>
        <SimpleForm>
            <Box justifyContent="end" sx={{ display: 'flex', width: '100%' }}>
                <ShowButton />
            </Box>
            <TextInput source="name" validate={required()} />
            <TextInput multiline source="alt_name" validate={required()} />
            <CustomRichTextInput source="description" validate={required()} />
        </SimpleForm>
    </Edit>
);

export default CreatorEdit;
