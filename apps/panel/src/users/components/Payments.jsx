import { useState } from 'react';
import {
    DateField,
    FunctionField,
    NumberField,
    ReferenceField,
    ReferenceManyField,
    TextField,
    WithListContext,
} from 'react-admin';

import { Box, Chip, Typography } from '@mui/material';
import { CustomDatagrid } from 'src/common/components/CustomDatagrid';
import { Pagination } from 'src/common/components/Paginations';
import usePaymentsTypes from 'src/hooks/usePaymentsTypes';

import ChapterInfoField from '../../chapters/common/ChapterInfoField.jsx';
import PublisherInfoField from '../../publishers/components/PublisherInfoField.jsx';
import TitleInfoField from '../../titles/common/TitleInfoField.jsx';

import { getStatusColorBase } from './utils';

const mapForms = (value, field, object) => object[field].find((v) => v.id === value)?.name || value;

export const getMoneyExpenseType = (type) => {
    switch (type) {
        case 'Пополения':
            return '+';
        case 'Расход':
            return '-';
    }

    return '';
};

export const getTicketExpenseType = (type) => {
    switch (type) {
        case 'Приход':
            return '+';
        case 'Расход':
            return '-';
    }

    return '';
};

const Sum = (props) => {
    const { sum, type, currency } = props;

    const prefix = currency === 'money' ? getMoneyExpenseType(type) : getTicketExpenseType(type);
    const color = getStatusColorBase({
        succeed: '+',
        failed: '-',
    })(prefix);

    return (
        <span style={{ color }}>
            {prefix}
            {sum}
        </span>
    );
};

const Money = () => {
    const { list: paymentsForms } = usePaymentsTypes();

    return (
        <ReferenceManyField
            target="user_id"
            source="id"
            label="Платежи"
            reference="payments-money"
            filter={{ meta: { idAsPath: true, metaFields: 'total' } }}
            pagination={<Pagination />}
        >
            <WithListContext
                render={({ data }) => {
                    const totals = data?.[0]?.__meta?.total;

                    if (!totals) return;

                    const [received, spent] = totals;

                    const diff = (received?.count ?? 0) - (spent?.count ?? 0);

                    const getColor = getStatusColorBase({
                        succeed: (v) => v > 0,
                        failed: (v) => v < 0,
                    });

                    return (
                        <Box display="flex" gap={2}>
                            {received ? (
                                <Typography>
                                    {received.transaction_type}:{' '}
                                    <Typography component="span" color="status.succeed">
                                        {received.count}
                                    </Typography>
                                </Typography>
                            ) : null}

                            {spent ? (
                                <Typography>
                                    {spent.transaction_type}:{' '}
                                    <Typography component="span" color="status.failed">
                                        {spent.count}
                                    </Typography>
                                </Typography>
                            ) : null}

                            <Typography>
                                Итого:{' '}
                                <Typography component="span" color={getColor(diff)}>
                                    {diff}
                                </Typography>
                            </Typography>
                        </Box>
                    );
                }}
            />

            <CustomDatagrid rowClick="edit" bulkActionButtons={false}>
                <NumberField source="id" label="ID" />
                <FunctionField
                    label="Сумма"
                    source="sum"
                    render={(record) => <Sum sum={record.sum} type={record.transaction_type} currency="money" />}
                />

                <FunctionField
                    label="Касса"
                    render={(record) =>
                        record.cash_box_id ? mapForms(record.cash_box_id, 'provider', paymentsForms) : 'Не указана'
                    }
                />
                <FunctionField
                    source="status"
                    label="Статус"
                    render={(record) => (
                        <span
                            style={{
                                color: getStatusColorBase({
                                    failed: 0,
                                    succeed: 1,
                                    pending: 2,
                                })(record.status),
                            }}
                        >
                            {mapForms(record.status, 'status', paymentsForms)}
                        </span>
                    )}
                />
                <DateField source="date" showTime label="Дата" />
                <FunctionField
                    source="type"
                    label="Тип"
                    render={(record) => mapForms(record.type, 'type', paymentsForms)}
                />
                <ReferenceField reference="titles" source="title_id" label="Тайтл">
                    <TitleInfoField clickable />
                </ReferenceField>
                <ReferenceField reference="chapters" source="chapter_id" label="Глава">
                    <ChapterInfoField clickable />
                </ReferenceField>
                <ReferenceField reference="publishers" source="publisher_id" label="Переводчик">
                    <PublisherInfoField clickable />
                </ReferenceField>

                <TextField sortable={false} source="comment" label="Комментарий" />
            </CustomDatagrid>
        </ReferenceManyField>
    );
};

const Ticket = () => {
    return (
        <ReferenceManyField
            target="user_id"
            source="id"
            label="Платежи"
            reference="payments-tickets"
            filter={{ meta: { idAsPath: true, metaFields: 'total' } }}
            pagination={<Pagination />}
        >
            <WithListContext
                render={({ data }) => {
                    const totals = data?.[0]?.__meta?.total;

                    if (!totals) return;

                    const received = totals[0] || { count: 0, transaction_type: 'Приход' };
                    const spent = totals[1] || { count: 0, transaction_type: 'Расход' };

                    const diff = received.count - spent.count;

                    const getColor = getStatusColorBase({
                        succeed: (v) => v > 0,
                        failed: (v) => v < 0,
                    });

                    return (
                        <Box display="flex" gap={2}>
                            <Typography>
                                {received.transaction_type}:{' '}
                                <Typography component="span" color="status.succeed">
                                    {received.count}
                                </Typography>
                            </Typography>
                            <Typography>
                                {spent.transaction_type}:{' '}
                                <Typography component="span" color="status.failed">
                                    {spent.count}
                                </Typography>
                            </Typography>
                            <Typography>
                                Итого:{' '}
                                <Typography component="span" color={getColor(diff)}>
                                    {diff}
                                </Typography>
                            </Typography>
                        </Box>
                    );
                }}
            />
            <CustomDatagrid rowClick="edit" bulkActionButtons={false}>
                <NumberField source="id" label="id" />
                <FunctionField
                    label="Сумма"
                    source="sum"
                    render={(record) => <Sum sum={record.sum} type={record.type} currency="ticket" />}
                />
                <TextField source="action_type" label="Статус" />
                <DateField source="created_at" showTime label="Дата получения" />
                <TextField source="type" label="Тип" />
            </CustomDatagrid>
        </ReferenceManyField>
    );
};

const TYPES = {
    money: 'Деньги',
    ticket: 'Тикеты',
};

export const Payments = () => {
    const { isLoading } = usePaymentsTypes();

    const [currency, setCurrency] = useState('money');

    if (isLoading) return null;

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" gap={1}>
                {Object.entries(TYPES).map(([key, value]) => (
                    <Chip
                        key={key}
                        onClick={() => setCurrency(key)}
                        label={value}
                        variant={key === currency ? 'primary' : 'outlined'}
                    />
                ))}
            </Box>

            {currency === 'money' ? <Money /> : null}
            {currency === 'ticket' ? <Ticket /> : null}
        </Box>
    );
};
