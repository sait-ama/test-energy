import { SelectInput } from 'react-admin';

import { getLabelSx } from '../styles/edited';

export const CustomSelect = ({ isNew, ...rest }) => {
    return (
        <SelectInput
            variant="outlined"
            InputLabelProps={{
                shrink: true,
                sx: getLabelSx(isNew),
            }}
            // PaperComponent={AutocompletePaper}
            fullWidth
            {...rest}
        />
    );
};
