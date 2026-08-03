import { BooleanInput, Labeled, ReferenceField, useRecordContext } from 'react-admin';

import { Box } from '@mui/material';
import { CustomArrayAutocomplete } from 'src/common/fields/AutoCompleteArray';
import useMomentTagTypes from 'src/hooks/useMomentTagTypes';

import { CustomImage } from '../../../common/fields/ImageField.jsx';
import { CustomRichTextInput } from '../../../common/fields/RichTextInput';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestMomentAdd = () => {
    const { list, isLoading } = useMomentTagTypes();
    const record = useRecordContext();

    if (isLoading || !record) return null;

    return (
        <Box display="flex" gap={2}>
            <Labeled label="Аватар">
                <CustomImage
                    src={record.data?.image}
                    sx={{
                        width: 200,
                    }}
                />
            </Labeled>
            <Box>
                <Labeled sx={{ mb: 2 }}>
                    <ReferenceField label="Тайтл" reference="titles" source="data.title" target="id">
                        <TitleInfoField clickable />
                    </ReferenceField>
                </Labeled>
                <CustomRichTextInput source="data.description" label="Описание" toolbar={() => null} />
                <Box sx={{ display: 'flex', width: '100%', justifyItems: 'space-between', gap: '16px' }}>
                    <Box width="100%">
                        <CustomArrayAutocomplete source="data.tags" optionValue="id" choices={list} label="Категории" />
                    </Box>
                    <Box>
                        <Labeled>
                            <BooleanInput source="data.is_spoiler" name="Спойлер" size="small" label="Спойлер" />
                        </Labeled>
                    </Box>

                </Box>
            </Box>
        </Box>
    );
};
