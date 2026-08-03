import { useFormState, useWatch } from 'react-hook-form';

import { useFormControl } from '@mui/material';

import { CustomArrayAutocomplete } from '../AutoCompleteArray';

import { CompareBase } from './CompareBase';

export const AutocompleteComparisonField = ({
    choices,
    label,
    hidden,
    readonly,
    prevBaseName = 'title',
    currentBaseName = 'data',
    fieldName,
    ...rest
}) => {
    const { disabled, touchedFields } = useFormState();
    const control = useFormControl();

    const prevName = `${prevBaseName}.${fieldName}`;
    const prevValue = useWatch({ control, name: prevName });
    const currentName = `${currentBaseName}.${fieldName}`;
    const currentValue = useWatch({ control, name: currentName });

    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (currentValue && prevValue !== currentValue);

    const isValue = (v) => typeof v !== 'undefined' && v !== null;

    const renderOptionWithNew = (choice) => {
        const isNew = isValue(prevValue) && !prevValue.find((id) => id === choice.id);

        if (isNew) return <span style={{ color: '#3eb683' }}>{choice.name}</span>;

        return choice.name;
    };

    const renderOptionWithDeleted = (choice) => {
        const isDeleted = isValue(currentValue) && !currentValue.find((id) => id === choice.id);

        if (isDeleted) return <span style={{ color: 'red' }}>{choice.name}</span>;

        return choice.name;
    };

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            {...rest}
            left={
                <CustomArrayAutocomplete
                    name={prevName}
                    source={prevName}
                    choices={choices}
                    disabled
                    optionText={renderOptionWithDeleted}
                    label={label}
                />
            }
            right={
                <CustomArrayAutocomplete
                    name={currentName}
                    defaultValue={prevValue}
                    source={currentName}
                    optionText={renderOptionWithNew}
                    disabled={disabled || readonly}
                    choices={choices}
                    autoFocus
                    label={label}
                />
            }
        />
    );
};
