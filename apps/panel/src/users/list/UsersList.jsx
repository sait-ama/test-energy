import { BooleanField, List, NumberField,TextField } from 'react-admin';
import { FilterList, FilterListItem,FilterLiveSearch } from 'react-admin';

import { CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import { Pagination } from 'src/common/components/Paginations';
import UserInfoField from 'src/users/components/UserInfoField';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

const rowStyle = () => ({
    //    backgroundColor: '#1e1e1e',
    //    marginTop: '20px',
    //    border: 0,
    //    borderRadius: '10px',
});

const UserList = () => (
    <List
        //    sort={{ field: "lastName", order: "ASC" }}
        aside={
            <Card sx={{ order: -1, mt: 1, mr: 2, width: 200 }}>
                <CardContent>
                    <FilterLiveSearch source="search" />
                    <FilterList label="Забанен">
                        <FilterListItem label="Да" value={{ is_banned: true }} />
                        <FilterListItem label="Нет" value={{ is_banned: false }} />
                    </FilterList>
                    <FilterList label="Активный">
                        <FilterListItem label="Да" value={{ is_active: true }} />
                        <FilterListItem label="Нет" value={{ is_active: false }} />
                    </FilterList>
                    <FilterList label="Использует прилу">
                        <FilterListItem label="Да" value={{ app_extended_catalog: true }} />
                        <FilterListItem label="Нет" value={{ app_extended_catalog: false }} />
                    </FilterList>
                </CardContent>
            </Card>
        }
        perPage={20}
        exporter={false}
        actions={null}
        style={{ width: '100%' }}
        pagination={<Pagination />}
        //    optimized
    >
        <CustomDatagrid rowClick="show" rowStyle={rowStyle} bulkActionButtons={false}>
            <UserInfoField />
            <TextField source="balance" label="Баланс" />
            <TextField source="ticket_balance" label="Тикетов" />
            <TextField source="count_comments" label="Комментариев" />
            <BooleanField source="is_banned" label="Забанен" />
            <BooleanField source="is_active" label="Активен" />
            <NumberField source="id" />
        </CustomDatagrid>
    </List>
);

export default UserList;
