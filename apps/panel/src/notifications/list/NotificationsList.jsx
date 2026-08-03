import { FilterList, FilterListItem, List } from 'react-admin';

import { Box } from '@mui/material';

import { Pagination } from '../../common/components/Paginations.jsx';
import { NotificationsDatagrid } from '../components/NotificationsDatagrid.jsx';


export default function NotificationsList () {
    return (
        <List
            //    sort={{ field: "lastName", order: "ASC" }}
            aside={
                   <Box sx={{ display: 'flex', flexDirection: 'column', p: 1 }}>
               <FilterList icon={null} label="Тип">
                   <FilterListItem label="Обновления" value={{ type: 0 }} />
                   <FilterListItem label="Социальное" value={{ type: 1  }} />
                   <FilterListItem label="Важное" value={{ type: 2 }} />
               </FilterList>
               <FilterList label="Прочитано" icon={null}>
                   <FilterListItem label="Да" value={{ status: 1 }} />
                   <FilterListItem label="Нет" value={{ status: 0 }} />
               </FilterList>
               </Box>
            }
            perPage={20}
            exporter={false}
            sort={{field: 'id', order: 'DESC' }}
            style={{ width: '100%' }}
            pagination={<Pagination />}
               optimized
        >
            <NotificationsDatagrid/>
        </List>
    )
}