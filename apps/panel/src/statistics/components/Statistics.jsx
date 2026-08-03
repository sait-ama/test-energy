import { FormProvider, useForm } from 'react-hook-form';

import { Box, Button } from '@mui/material';
import dayjs from 'dayjs';
import { DateInput } from 'ra-ui-materialui';
import { CustomSelect } from 'src/common/fields/Select';
import useStatistics from 'src/hooks/useStatistics';

const choices = [
    { id: 'income', name: 'По доходу' },
    { id: 'charge', name: 'Пополнения' },
    { id: 'requests_by_moder', name: 'Заявки по модеру' },
    { id: 'requests_by_moder_day', name: 'Стата модеров по дням' },
    { id: 'time_moder', name: 'Ответы по модеру' },
    { id: 'time_request', name: 'Ответы по заявке' },
    { id: 'statistics', name: 'Общая стата' },
];

const formatDateFe = (date) => dayjs(date).format('YYYY-MM-DD');
const formatDateBe = (date) => dayjs(date).format('DD.MM.YYYY');

export const Statistics = () => {
    const methods = useForm({
        defaultValues: {
            type: 'income',
            date_start: formatDateFe(dayjs().subtract(7, 'days')),
            date_end: formatDateFe(),
        },
    });
    const { watch } = methods;

    const { method, date_start, date_end } = watch();

    const { data, isLoading, isError } = useStatistics({
        method,
        date_start: formatDateBe(date_start),
        date_end: formatDateBe(date_end),
    });

    const filename = `${method}__${date_start}__${date_end}.csv`;

    return (
        <Box display="flex" gap={3} marginTop={4} alignItems="center">
            <Box display="flex" gap={2}>
                <FormProvider {...methods}>
                    <CustomSelect
                        label="Тип"
                        defaultValue={choices[0].id}
                        name="method"
                        source="adsfasd"
                        choices={choices}
                    />
                    <DateInput name="date_start" label="Дата начала" fullWidth />
                    <DateInput name="date_end" label="Дата окончания" fullWidth />
                </FormProvider>
            </Box>
            <a href={data} download={filename}>
                <Button disabled={isLoading || isError} sx={{ marginBottom: '20px' }}>
                    Скачать {isLoading ? filename : ''}
                </Button>
            </a>
        </Box>
    );
};

export default Statistics;
