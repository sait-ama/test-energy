import {
    Labeled,
    ReferenceManyField,
    useRecordContext,
} from 'react-admin';

import { Box } from '@mui/material';
import { CustomRichTextInput } from 'src/common/fields/RichTextInput.jsx';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import { CustomImage } from '../../../common/fields/ImageField.jsx';
import { CustomTextInput } from '../../../common/fields/TextInput';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestCharacterAdd = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <Box display="flex" gap={2}>
            <Labeled label="Аватар">
                <CustomImage
                    src={record.data?.cover}
                    sx={{
                        width: 200,
                    }}
                />
            </Labeled>
            <Box>
                <Labeled sx={{ mb: 2 }}>
                    <ReferenceManyField label="Тайтлы" reference="titles" source="data.titles" target="id">
                        <CustomDatagrid bulkActionButtons={false}>
                            <TitleInfoField />
                        </CustomDatagrid>
                    </ReferenceManyField>
                </Labeled>

                <CustomTextInput name="data.name" source="data.name" label="Название" />
                <CustomTextInput name="data.alt_name" source="data.alt_name" label="Альт. название" />

                <CustomRichTextInput
                    name="data.description"
                    source="data.description"
                    toolbar={() => null}
                    label="Описание"
                    fullWidth
                />

                <CustomTextInput name="data.details.power" source="data.details.power" label="Сила" />
                <CustomTextInput name="data.details.sex" source="data.details.sex" label="Пол" />
                <CustomTextInput name="data.details.classification" source="data.details.classification"
                                 label="Классификация" />
                <CustomTextInput name="data.details.affiliation" source="data.details.affiliation"
                                 label="Принадлежность" />
                <CustomTextInput name="data.details.age" source="data.details.age" label="Возраст" />
                <CustomTextInput name="data.details.skills" source="data.details.skills" label="Навыки" />
            </Box>
        </Box>
    );
};
