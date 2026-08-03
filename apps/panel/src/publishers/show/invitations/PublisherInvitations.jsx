import { Datagrid, DateField, FunctionField, List, ReferenceField, useRecordContext } from 'react-admin';

import UserInfoField from 'src/users/components/UserInfoField.jsx';

const statusMap = {
    1: 'В ожидании',
    2: 'Принято',
    3: 'Отклонено',
};

export const PublisherInvitations = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <List
            resource="publisher-invitations"
            filter={{ publisher_id: record.id }}
            disableSyncWithLocation
            actions={false}
            pagination={false}
        >
            <Datagrid bulkActionButtons={false}>
                <FunctionField source="id" label="ID" render={(record) => record.id} />
                <ReferenceField source="user" reference="users" label="Пользователь" link="show">
                    <UserInfoField clickable />
                </ReferenceField>
                <FunctionField
                    source="status"
                    label="Статус"
                    render={(record) => statusMap[record.status] || record.status}
                />
                <DateField source="created_at" label="Создан" showTime />
                <DateField source="updated_at" label="Обновлен" showTime />
            </Datagrid>
        </List>
    );
};
