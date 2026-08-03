import React from 'react';

import { Box } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TitleInfoField from 'src/titles/common/TitleInfoField';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import { CompareBase } from '../../../common/fields/comparison/CompareBase.jsx';
import { ComparisonLabel } from '../../../common/fields/comparison/ComparisonLabel.jsx';
import { ImageComparisonField } from '../../../common/fields/comparison/ImageComparisonField.jsx';
import { ReferenceComparisonField } from '../../../common/fields/comparison/ReferenceComparisonField.jsx';
import { RichTextComparisonField } from '../../../common/fields/comparison/RichTextComparisonField.jsx';
import { TextComparisonField } from '../../../common/fields/comparison/TextComparisonField.jsx';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import { useOpen } from '../../../hooks/useOpen.js';

export const RequestCharacterUpdate = () => {
    const [hidden, toggle] = useOpen(true);

    useTouchChangedFields();

    return (
        <Box>
            <CompareBase
                left={null}
                right={
                    <FormControlLabel
                        control={<Switch checked={hidden} onChange={toggle} name="hidden" size="small" />}
                        label="Показать только измененные значения"
                        style={{ marginLeft: 'auto' }}
                        componentsProps={{
                            typography: {
                                sx: { fontSize: 14, marginLeft: 1 },
                            },
                        }}
                    />
                }
            />

            <ComparisonLabel />

            <ImageComparisonField fieldName="cover" prevBaseName="old_data" label="Картинка" hidden={hidden} />

            <TextComparisonField fieldName="name" prevBaseName="old_data" label="Имя" hidden={hidden} />
            <TextComparisonField fieldName="alt_name" prevBaseName="old_data" label="Альт. имя" hidden={hidden} />


            <RichTextComparisonField fieldName="description" prevBaseName="old_data" label="Описание" hidden={hidden} />

            <TextComparisonField fieldName="details.power" prevBaseName="old_data" label="Сила" hidden={hidden} />
            <TextComparisonField fieldName="details.sex" prevBaseName="old_data" label="Пол" hidden={hidden} />
            <TextComparisonField fieldName="details.classification" prevBaseName="old_data" label="Классификация"
                                 hidden={hidden} />
            <TextComparisonField fieldName="details.affiliation" prevBaseName="old_data" label="Принадлежность"
                                 hidden={hidden} />
            <TextComparisonField fieldName="details.age" prevBaseName="old_data" label="Возраст" hidden={hidden} />
            <TextComparisonField fieldName="details.skills" prevBaseName="old_data" label="Навыки" hidden={hidden} />

            <ReferenceComparisonField many fieldName="titles" prevBaseName="old_data" reference="titles" label="Навыки" hidden={hidden}>
                <CustomDatagrid bulkActionButtons={false}>
                    <TitleInfoField />
                </CustomDatagrid>
            </ReferenceComparisonField>
        </Box>
    );
};
