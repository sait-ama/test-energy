import { useRef } from 'react';
import { TextInput } from 'react-admin';
import { useFormState } from 'react-hook-form';

import { Box } from '@mui/material';

import { Presets } from './Presets';

export const ModeratorMessageField = (props) => {
    const { name = 'moderator_message', baseName, ...rest } = props;
    const { disabled } = useFormState();
    const ref = useRef(null);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <TextInput
                inputRef={ref}
                name={name}
                multiline
                label="Сообщение для предложившего"
                variant="outlined"
                helperText=""
                rows={5}
                disabled={disabled}
                fullWidth
                {...rest}
            />
            {!disabled && <Presets baseName={baseName} inputName={name} />}
        </Box>
    );
};
