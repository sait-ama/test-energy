import { Create, NumberInput, SimpleForm, useRecordContext } from 'react-admin';

import { Typography } from '@mui/material';

const GivePromoDaysForm = () => (
    <>
        <Typography sx={{ mb: 2 }} variant="h4">
            Выдать тикеты
        </Typography>
        <NumberInput name="days" defaultValue={50} label="Количество" source="sum" sx={{ width: '100%' }} />
    </>
);

export const GivePromoDays = ({ onSuccess }) => {
    const record = useRecordContext();

    return (
        <Create
            resource="promotions"
            mutationOptions={{ onSuccess }}
            sx={{ '& .RaCreate-main': { mt: '0 !important' } }}
            transform={(data) => ({ ...data, publisher_id: record.id })}
        >
            <SimpleForm>
                <GivePromoDaysForm />
            </SimpleForm>
        </Create>
    );
};
