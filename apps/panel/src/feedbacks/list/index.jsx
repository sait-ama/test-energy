import {
    DateField,
    FilterList, FilterListItem,
    FunctionField,
    List,
    TextField,
    useRefresh,
} from 'react-admin';

import { Box, Stack } from '@mui/material';
import UserInfoField from 'src/users/components/UserInfoField.jsx';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import { Empty } from '../../common/components/Empty';
import { Pagination } from '../../common/components/Paginations';
import { IconStatusField } from '../../common/fields/IconStatusField';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { feedbackTypes, getType, statusToIconMap } from '../utils.js';

import rowSx from './rowSx';

import classes from '../Feedbacks.module.css';





const feedbackStatuses = [
    {
        id: 1,
        name: 'В ожидании',
    },
    {
        id: 2,
        name: 'Обрабатывается',
    },
    {
        id: 3,
        name: 'Обработано',
    },
    {
        id: 4,
        name: 'Отклонен',
    },
];



const FeedbackList = (props) => {
    const refresh = useRefresh();
    useRecursiveTimeout(() => refresh(), 30000);

    return (
        <List exporter={false} actions={null} perPage={50} {...props}
              aside={
                  <Stack direction="column" alignItems="start" sx={{ px: 2, py: 1, width: '20%' }}>


                      <Box>
                          <FilterList label="Статус фидбэка">
                              {feedbackStatuses.map((feedback) => (
                                  <FilterListItem key={feedback.id} label={feedback.name}
                                                  value={{ status: feedback.id }} />
                              ))}
                          </FilterList>
                      </Box>
                      <Box>
                          <FilterList label="Тип фидбэка">
                              {feedbackTypes.map((feedback) => (
                                  <FilterListItem key={feedback.id} label={feedback.name}
                                                  value={{ type: feedback.id }} />
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
                    source="created_at"
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
                <TextField source="topic" label="Топик" sortable={false} />
                <TextField source="platform" label="Платформа" sortable={false} />
                <FunctionField label="Тип"  render={({ type }) => getType(type)} />
                <UserInfoField source="user" label="Пользователь" sortable={false} clickable />
                <IconStatusField label="Статус" map={statusToIconMap} />
            </CustomDatagrid>
        </List>
    );
};

export default FeedbackList;
