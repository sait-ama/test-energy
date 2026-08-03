import { BooleanInput, Create, DateInput,DateTimeInput, required, SimpleForm, useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';

import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { CustomSelect } from 'src/common/fields/Select';
import { CustomTextInput } from 'src/common/fields/TextInput';

export const banTypeChoices = [
    { id: 1, name: 'Блокировка аккаунта' },
    { id: 2, name: 'Блокировка комментариев' },
    { id: 3, name: 'Блокировка постов' },
    { id: 4, name: 'Блокировка моментов' },
    { id: 5, name: 'Блокировка создания карт' },
    { id: 6, name: 'Блокировка создания персонажей' },
];

//value in minutes
const incrementExpiresConfig = [
    { value: 30, label: '+30м' },
    { value: 360, label: '+6ч' },
    { value: 1440, label: '+24ч' },
];

const BanCreateForm = () => {
    const { watch, setValue, getValues } = useFormContext();

    const { ban_forever, block_all_comments } = watch();

    const handleIncrementExpires = (increment) => {
        const { expires } = getValues();

        const incrementedExpires = dayjs(expires).add(increment, 'minute').toDate();

        setValue('expires', incrementedExpires);
    };

    return (
        <>
            <Typography sx={{ mb: 2 }} variant="h4">
                Выдать бан
            </Typography>
            <DateTimeInput
                defaultValue={new Date(Date.now())}
                name="expires"
                disabled={ban_forever}
                label="Дата окончания"
                source="expires"
                fullWidth
                validate={required()}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BooleanInput label="Бесконечный бан" source="ban_forever" />
                <Box sx={{ display: 'flex', marginBottom: '20px',  }}>
                    {incrementExpiresConfig.map(({ value, label }) => (
                        <Button onClick={() => handleIncrementExpires(value)}>{label}</Button>
                    ))}
                </Box>
            </Box>
            <CustomSelect
                label="Тип бана"
                defaultValue={2}
                source="type"
                name="type"
                choices={banTypeChoices}
                validate={required()}
            />
            <BooleanInput label="Удалить все комменты" source="block_all_comments" />
            {block_all_comments ? (
                <DateInput
                    source="from_date"
                    name="from_date"
                    label="С какой даты забанить комментарии"
                    fullWidth
                />
            ) : null}

            <CustomTextInput name="comment" label="Причина" source="comment" validate={required()}/>
        </>
    );
};

export const BanCreate = ({ onSuccess }) => {
    const user = useRecordContext();

    return (
        <Create
            resource="bans"
            mutationOptions={{ onSuccess }}
            sx={{ '& .RaCreate-main': { mt: '0 !important' } }}
            transform={(data) => ({
                ...data,
                expires: data.ban_forever ? null : data.expires,
                block_all_comments: Number(data.block_all_comments),
                user: user?.id,
            })}
        >
            <SimpleForm>
                <BanCreateForm />
            </SimpleForm>
        </Create>
    );
};
