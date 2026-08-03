import { ArrayField, NumberField, TextField, WithListContext } from 'react-admin';

import usePrivileges from 'src/hooks/usePrivileges.js';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

export const UserPublishersList = () => {
    const { getNameById, isFetching } = usePrivileges();

    if (isFetching) return null;

    return (
        <ArrayField source="publishers" label="">
            <CustomDatagrid
                bulkActionButtons={false}
                optimized
                resource="publishers"
                rowClick={(resource, id, record) => `/publishers/${record.publisher.id}/show`}
            >
                <TextField source="publisher.name" label="Название" />
                <TextField source="privileges.name" label="Роль" />

                <ArrayField source="privileges.rights" label="Права">
                    <WithListContext
                        render={({ data }) =>
                            <ul className="flex gap-1 flex-wrap">
                                {data.map((it) => getNameById(it, 'rights')).join(', ')}
                            </ul>
                        } />

                </ArrayField>

                <NumberField source="publisher.id" label="ID" />

            </CustomDatagrid>
        </ArrayField>
    );
};
