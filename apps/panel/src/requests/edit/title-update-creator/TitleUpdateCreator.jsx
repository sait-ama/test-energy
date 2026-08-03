import React from 'react';
import { useRecordContext } from 'react-admin';

import { Box } from '@mui/material';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import { ReferenceComparisonField } from '../../../common/fields/comparison/ReferenceComparisonField.jsx';
import CreatorInfoField from '../../../creators/components/CreatorInfoField.jsx';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

const settings = {
    prevBaseName: 'old_data',
    currentBaseName: 'data',
};

export const RequestTitleUpdateCreator = () => {
    const record = useRecordContext();

    if (!record?.data) return null;

    return (
        <Box>
            <TitleInfoField source="title" clickable />
            <Box sx={{ my: 2 }}>
                <ReferenceComparisonField
                    {...settings}
                    label="Создатели"
                    fieldName="creators"
                    reference="creators"
                    target="id"
                    many
                    fieldProps={{
                        filter: {
                            meta: {
                                requireParam: true,
                            },
                        },
                    }}
                >
                    <CustomDatagrid bulkActionButtons={false}>
                        <CreatorInfoField clickable />
                    </CustomDatagrid>
                </ReferenceComparisonField>
            </Box>
        </Box>
    );
};
