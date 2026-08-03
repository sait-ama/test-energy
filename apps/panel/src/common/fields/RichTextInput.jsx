import { useFormState } from 'react-hook-form';

import { RichTextInput } from 'ra-input-rich-text';

import { getLabelSx } from '../styles/edited.js';

export const CustomRichTextInput = (props) => {
    const { disabled } = useFormState();
    const { isNew, ...rest } = props;

    return (
        <RichTextInput
            fullWidth
            {...rest}
            disabled={disabled}
            sx={{
                ...getLabelSx(isNew),
                '& .RaRichTextInput-editorContent div': {
                    backgroundColor: 'transparent !important',
                },
            }}
        />
    );
};
