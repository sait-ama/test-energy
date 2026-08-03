import {
    DateField,
    FilterButton,
    FilterForm,
    FilterList, FilterListItem,
    FunctionField,
    List, NumberInput,
    TextField,
    useRefresh,
} from 'react-admin';

import { Box, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import UserInfoField from 'src/users/components/UserInfoField.jsx';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import { Empty } from '../../common/components/Empty';
import { IncludeExcludeFilter } from '../../common/components/ExcludableFilters.jsx';
import { Pagination } from '../../common/components/Paginations';
import { IconStatusField } from '../../common/fields/IconStatusField';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import useReportsTypes from '../../hooks/useReportsTypes.js';
import { useCountRequests } from '../../hooks/useUncheckedRequests.js';
import { statusToIconMap } from '../utils.js';

import rowSx from './rowSx';

import classes from '../Reports.module.css';


const requestFilters = [
    <NumberInput label="ID сущности" source="target" />,
    <NumberInput label="ID юзера" source="user_id" />,
    <NumberInput label="ID модератора" source="moderator_id" />,
];

const requestStatuses = [
    {
        id: 0,
        name: 'В ожидании',
    },
    {
        id: 1,
        name: 'В процессе',
    },
    {
        id: 2,
        name: 'Обработан',
    },
    {
        id: 3,
        name: 'Отклонен',
    },
];

export const reportIdToName = {
    0: 'all_reports_count',
    1: 'report_titles_count',
    2: 'report_chapters_count',
    3: 'report_publishers_count',
    4: 'report_comments_count',
    5: 'report_creators_count',
    6: 'report_users_count',
    7: 'report_posts_count',
    8: 'report_cards_count',
    9: 'report_moments_count',
}

const ReportList = (props) => {
    const refresh = useRefresh();
    useRecursiveTimeout(() => refresh(), 30000);
    const { data: counts } = useCountRequests()
    const { list, isLoading } = useReportsTypes()

    if (isLoading) return null;

    const id2Name = list.reports.reduce((acc, it) => {
        acc[it.id] = it.name

        return acc
    }, {})

    return (
        <List exporter={false} actions={null} perPage={50} {...props}
              aside={
                  <Stack direction="column" alignItems="start" sx={{ px: 2, py: 1, width: '20%' }}>
                      <Box>
                          <Box display="flex" gap={1} alignItem="center">
                              <FilterForm filters={requestFilters} />
                          </Box>
                          <FilterButton filters={requestFilters} />
                      </Box>

                      <Box>
                          <IncludeExcludeFilter choices={list.reports} label="Тип репорта" name="type" renderCount={({id}) =>
                              <Typography variant="caption"
                                          color="textSecondary">
                                  {counts[reportIdToName[id]]}
                              </Typography>
                          } />
                      </Box>
                      <Box>
                          <FilterList label="Статус репорта">
                              {requestStatuses.map((request) => (
                                  <FilterListItem key={request.id} label={request.name}
                                                  value={{ status: request.id }} />
                              ))}
                          </FilterList>
                      </Box>
                  </Stack>
              }
              pagination={<Pagination />} sx={{ mt: 1 }}>
            <CustomDatagrid
                optimized
                rowClick="show"
                className={classes.table}
                rowSx={rowSx}
                bulkActionButtons={false}
                {...props}
                empty={<Empty />}
            >
                <DateField
                    source="date"
                    label="Время"
                    showTime
                    options={{
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                    locales="ru-Ru"
                    sortable={false}
                    sx={{ ml: 3 }}
                />
                <TextField source="reason.name" label="Причина" sortable={false} />
                <FunctionField render={(record) => id2Name[record.type]} label="Тип репорта" sortable={false} />

                <UserInfoField source="user" label="Репортер" sortable={false} clickable />
                <UserInfoField source="moderator" label="Модератор" sortable={false} clickable />

                <IconStatusField label="Статус" map={statusToIconMap} />
            </CustomDatagrid>
        </List>
    );
};

export default ReportList;
