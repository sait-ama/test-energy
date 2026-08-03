import { Create, NumberInput,SimpleForm, useRecordContext } from 'react-admin';

import { Typography } from '@mui/material';
import { CustomTextInput } from 'src/common/fields/TextInput';

const GiveTicketsForm = () => (
    <>
        <Typography sx={{ mb: 2 }} variant="h4">
            Выдать тикеты
        </Typography>
        <NumberInput name="sum" label="Количество" source="sum" sx={{ width: '100%' }} />
        <CustomTextInput name="comment" label="Комментарий" source="comment" />
    </>
);

export const GiveTickets = ({ onSuccess }) => {
    const user = useRecordContext();

    return (
        <Create
            resource="tickets"
            mutationOptions={{ onSuccess }}
            sx={{ '& .RaCreate-main': { mt: '0 !important' } }}
            transform={(data) => ({ ...data, user: user?.id })}
        >
            <SimpleForm>
                <GiveTicketsForm />
            </SimpleForm>
        </Create>
    );
};
