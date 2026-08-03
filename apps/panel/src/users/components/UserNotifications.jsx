import React from 'react';
import { FilterList, FilterListItem, List, ReferenceManyField, useRecordContext } from 'react-admin';

import Box from '@mui/material/Box';

import { Pagination } from '../../common/components/Paginations.jsx';
import { NotificationsDatagrid } from '../../notifications/components/NotificationsDatagrid.jsx';

export const UserNotifications = () => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <ReferenceManyField target="user_id" source="id" label="Уведомления" reference="notifications">
            <List
                exporter={false}
                pagination={<Pagination />}
                filter={{ user_id: record.id }}
                sort={{ field: 'id', order: 'DESC' }}
                aside={
                    <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
                        <FilterList icon={null} label="Тип">
                            <FilterListItem label="Обновления" value={{ type: 0 }} />
                            <FilterListItem label="Социальное" value={{ type: 1 }} />
                            <FilterListItem label="Важное" value={{ type: 2 }} />
                        </FilterList>
                        <FilterList label="Прочитано" icon={null}>
                            <FilterListItem label="Да" value={{ status: 1 }} />
                            <FilterListItem label="Нет" value={{ status: 0 }} />
                        </FilterList>
                    </Box>
                }
            >
                <NotificationsDatagrid />
            </List>
        </ReferenceManyField>
    );
};
