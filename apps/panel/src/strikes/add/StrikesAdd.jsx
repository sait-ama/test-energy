import { Create, DateInput,SimpleForm } from 'react-admin';

import { Typography } from '@mui/material';

import { CustomArrayAutocomplete } from '../../common/fields/AutoCompleteArray';
import { CustomTextInput } from '../../common/fields/TextInput';
import usePublisherTypes from '../../hooks/usePublisherTypes.js';

export const StrikesAdd = ({ onSuccess, ...rest }) => {
    const { list: types, isLoading } = usePublisherTypes();

    if (isLoading) return null;

    return (
        <Create
            resource="strikes"
            mutationOptions={{ onSuccess }}
            sx={{ '& .RaCreate-main': { mt: '0 !important' } }}
            {...rest}
        >
            <SimpleForm>
                <Typography sx={{ mb: 2 }} variant="h4">
                    Выдать страйк
                </Typography>
                <CustomTextInput name="reason" label="Причина" source="reason" />
                <DateInput name="date_end" label="Дата окончания" source="date_end" fullWidth />
                <CustomArrayAutocomplete
                    name="restrictions"
                    label="Ограничения"
                    source="restrictions"
                    choices={types.restrictions}
                />
            </SimpleForm>
        </Create>
    );
};
