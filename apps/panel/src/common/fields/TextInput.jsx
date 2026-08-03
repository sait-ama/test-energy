import { TextInput } from 'react-admin';

import { getLabelSx } from '../styles/edited';

export const CustomTextInput = ({ isNew, ...props }) => {
    return (
        <TextInput
            InputLabelProps={{
                shrink: true,
                sx: getLabelSx(isNew),
            }}
            variant="outlined"
            fullWidth
            {...props}
        />
    );
};
