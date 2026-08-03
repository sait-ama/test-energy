import * as React from 'react';
import { DateField, FunctionField, List, TextField, useRecordContext, useRefresh } from 'react-admin';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import { IncludeExcludeFilter } from '../../common/components/ExcludableFilters.jsx';
import { Pagination } from '../../common/components/Paginations.jsx';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout.js';
import { showPublishers } from '../../utils/showPublishers.js';

import classes from '../Calls.module.css';

const CallsStatusField = () => {
    const { status } = useRecordContext();

    if (status.id === 1) return <Chip size="small" label="В ожидании" className={classes.redChip} />;

    if (status.id === 2) return <Chip size="small" label="Ведется диалог" className={classes.greenChip} />;

    if (status.id === 3) return <Chip size="small" label="Закрыто" className={classes.grayChip} />;

    return null;
};

const callsTypes = [
    {
        id: 1,
        name: 'Пользователи',
    },
    {
        id: 2,
        name: 'Карты',
    },
    {
        id: 3,
        name: 'Авторы',
    },
    {
        id: 4,
        name: 'Переводчики',
    },
];

const callsTypesObj = callsTypes.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {});

export const CallsList = () => {
    const refresh = useRefresh();
    useRecursiveTimeout(() => refresh(), 30000);

    return (
        <List
            exporter={false}
            actions={null}
            perPage={50}
            aside={
                <Box>
                    <IncludeExcludeFilter
                        choices={callsTypes}
                        label="Тип запроса"
                        name="call_types"
                        // renderCount={(choice) => (
                        //     <Typography variant="caption" color="textSecondary">
                        //         {counts[`${choice.id}_count`]}
                        //     </Typography>
                        // )}
                    />
                </Box>
            }
            pagination={<Pagination />}
            sx={{ mt: 1 }}
        >
            <CustomDatagrid rowClick="show" bulkActionButtons={false}>
                <FunctionField
                    render={(record) => (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="body2">{record.name}</Typography>
                            {record?.user?.publishers ? (
                                <Typography variant="caption" color="textSecondary">
                                    {showPublishers(record.user.publishers)}
                                </Typography>
                            ) : null}
                        </Box>
                    )}
                />
                <DateField
                    source="date"
                    label="Время обращения"
                    showTime
                    options={{
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                    locales="ru-RU"
                    sortable={false}
                />
                <TextField source="moderator.username" label="Модератор" sortable={false} />
                <CallsStatusField source="status" label="Статус" />
                <FunctionField render={(record) => callsTypesObj[record.call_type]} label="Тип" />
                <DateField
                    source="date_open"
                    label="Время открытия"
                    showTime
                    options={{
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                    locales={'ru-Ru'}
                    sortable={false}
                />
                <DateField
                    source="date_end"
                    label="Время закрытия"
                    showTime
                    options={{
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                    locales={'ru-Ru'}
                    sortable={false}
                />
            </CustomDatagrid>
        </List>
    );
};
