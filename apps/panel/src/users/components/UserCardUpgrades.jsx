import {
    DateField,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    SingleFieldList,
    useRecordContext,
} from 'react-admin';

import CardInfoField from '../../cards/components/CardInfoField.jsx';
import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import { Pagination } from '../../common/components/Paginations.jsx';

export const UserCardUpgrades = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <ReferenceManyField
            target="user_id"
            source="id"
            label="История апгрейдов карт"
            reference="card-upgrades"
            filter={{ meta: { idAsPath: true } }}
        >
            <CustomDatagrid exporter={false} pagination={<Pagination />}>
                <ReferenceField source="new_card" reference="cards">
                    <CardInfoField renderSecondaryField={() => null} />
                </ReferenceField>
                <ReferenceManyField source="old_cards" target="id" reference="cards">
                    <SingleFieldList sx={{ display: 'flex', flexDirection: 'column' }}>
                        <CardInfoField renderSecondaryField={() => null} />
                    </SingleFieldList>
                </ReferenceManyField>
                <DateField source="updated_at" />
                <DateField source="created_at" />
                <NumberField source="id" />
            </CustomDatagrid>
        </ReferenceManyField>
    );
};
