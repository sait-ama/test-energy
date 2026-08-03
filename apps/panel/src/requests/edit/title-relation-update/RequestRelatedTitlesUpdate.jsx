import { ArrayField, NumberField, ReferenceField, SelectField } from 'react-admin';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import useTitleTypes from '../../../hooks/useTitleTypes.js';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';

export const RequestRelatedTitlesUpdate = () => {
    const { list, isLoading } = useTitleTypes();

    if (isLoading) return null;

    return (
        <div className="flex gap-2">
            <ArrayField source="old_data.titles">
                <CustomDatagrid bulkActionButtons={false}>
                    <ReferenceField reference="titles" source="title" target="id">
                        <TitleInfoField />
                    </ReferenceField>
                    <SelectField source="type" choices={list.relations} />
                    <NumberField source="position" name="position" />
                </CustomDatagrid>
            </ArrayField>

            <ArrayField source="data.titles">
                <CustomDatagrid bulkActionButtons={false}>
                    <ReferenceField reference="titles" source="title" target="id">
                        <TitleInfoField />
                    </ReferenceField>
                    <SelectField source="type" choices={list.relations} />
                    <NumberField source="position" name="position" />
                </CustomDatagrid>
            </ArrayField>
        </div>
    );
};
