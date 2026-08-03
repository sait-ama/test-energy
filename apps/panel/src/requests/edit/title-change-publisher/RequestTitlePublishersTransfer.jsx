import * as React from 'react';
import { useEffect } from 'react';
import {
    DateField,
    Empty,
    FunctionField,
    Labeled,
    List,
    NumberField,
    Pagination,
RecordContextProvider,
    ReferenceManyField,
TextField, useGetOne,     useRecordContext, } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';

import Typography from '@mui/material/Typography';
import { RequestTypeField } from 'src/requests/list/RequestTypeField.jsx';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import { AutocompleteComparisonField } from '../../../common/fields/comparison/AutocompleteComparisonField.jsx';
import { useTouchChangedFields } from '../../../common/hooks/useTouchChangedFields.js';
import useTitleTypes from '../../../hooks/useTitleTypes.js';
import TitleInfoField from '../../../titles/common/TitleInfoField.jsx';
import UserInfoField from '../../../users/components/UserInfoField.jsx';

const resolveType = (record) => {
    if (!record) return;

    const { data } = record;

    if (!data) return;

    if (data.type === 'intercept') return 'Перехват';
    if (data.type === 'add') return 'Передача';
    if (data.type === 'reject') return 'Отказ';
    if (data.type === 'collab') return 'Совместка';

    return 'Не определено';
};

export const RequestTitlePublisher = ({ withUserMessage, readonly }) => {
    const { isLoading, list: types } = useTitleTypes();
    const recordContext = useRecordContext();

    if (isLoading || !recordContext) return null;

    return (
        <>
            <Labeled sx={{ mb: 2 }}>
                <FunctionField label="Тип" render={resolveType} />
            </Labeled>
            <AutocompleteComparisonField
                fieldName="publishers"
                prevBaseName="old_data"
                currentBaseName="data"
                readonly={readonly}
                choices={types.publishers}
            />
            {withUserMessage ? (
                <Labeled>
                    <TextField label="Комментарий пользователя" source="user_message" variant="body1" sx={{ mb: 1 }} />
                </Labeled>
            ) : null}
        </>
    );
};

export const RequestTitlePublishersExpandable = () => {
    const record = useRecordContext();
    const form = useForm()
    const { data, isPending, error } = useGetOne(
        'requests',
        { id: record.id },
    );

    useEffect(() => {
        form.reset(data)
    }, [data]);

    if (isPending) return null;

    if (error) return error;

    return <RecordContextProvider value={data}>
        <FormProvider {...form} >
            <RequestTitlePublisher readonly />
        </FormProvider>
    </RecordContextProvider>;
};


export const AcceptedRequestTitlePublishersDatagrid = (props) => {
    return (
        <CustomDatagrid
            {...props}
            optimized
            expand={
                <RequestTitlePublishersExpandable withUserMessage />
            }
            rowClick="show"
            bulkActionButtons={false}
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
                locales="ru-RU"
            />
            <RequestTypeField sortable={false} label="Заявка" />
            <UserInfoField source="moderator" label="Модератор" clickable />

            <DateField
                source="updated_at"
                label="Время обработки"
                showTime
                options={{
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }}
                locales="ru-RU"
            />
        </CustomDatagrid>
    );
};

export const RequestTitlePublishersTransfer = () => {
    const recordContext = useRecordContext();

    useTouchChangedFields('data');

    return (
        <>
            <RequestTitlePublisher />

            <ReferenceManyField reference="branches" source="data.branch" target="id">
                <CustomDatagrid bulkActionButtons={false}>
                    <NumberField source="id" label="ID" />
                    <TitleInfoField clickable source="title" label="Тайтл" />
                    <DateField source="immune_date" label="Иммунитет до" />
                    <NumberField source="count_chapters" label="Количество глав" />
                </CustomDatagrid>
            </ReferenceManyField>

            <div className="flex flex-col gap-2 mt-20">
                <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                    }}
                >
                    Принятые запросы по тайтлу
                </Typography>
                <List
                    exporter={false}
                    actions={null}
                    perPage={10}
                    filter={{
                        type: 'title_change_publisher',
                        status: '2_accepted',
                        title_id: recordContext?.title?.id,
                    }}
                    sort={{ field: 'created_at', order: 'DESC' }}
                    pagination={<Pagination />}
                    sx={{ width: '100%', mt: 1 }}
                >
                    <AcceptedRequestTitlePublishersDatagrid
                        rowSx={(record) =>
                            record.id === recordContext.id
                                ? { borderLeftColor: '#3178c6', borderLeftWidth: 5, borderLeftStyle: 'solid' }
                                : undefined
                        }
                    />
                </List>
            </div>
        </>
    );
};
