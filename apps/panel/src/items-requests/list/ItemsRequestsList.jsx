import { DateField, List, NumberField, TextField } from 'react-admin';

import { Pagination } from 'src/common/components/Paginations';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

const ItemsRequestsList = () => {
    return (
        <List
            sort={{ field: 'id', order: 'ASC' }}
            perPage={20}
            exporter={false}
            actions={null}
            bulkActionButtons={false}
            //    optimized
            style={{ width: '100%' }}
            pagination={<Pagination />}
        >
            <CustomDatagrid>
                <TextField source="club_message" />
                {/*<ReferenceOneField source="user_id" reference="users" target="id">*/}
                {/*    <UserInfoField />*/}
                {/*</ReferenceOneField>*/}
                <TextField source="moderator_message" />
                <DateField source="created_at" />
                <NumberField source="id" />
            </CustomDatagrid>
        </List>
    );
};

export default ItemsRequestsList;
