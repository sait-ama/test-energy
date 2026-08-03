import { AutocompleteArrayInput } from 'react-admin';

import { AutocompletePaper } from '../components/Paper';

export const CustomArrayAutocomplete = (props) => {
    return (
        <AutocompleteArrayInput
            debounce={2000}
            limitTags={999}
            PaperComponent={AutocompletePaper}
            size="medium"
            variant="outlined"
            fullWidth
            {...props}
        />
    );
};
