import { useFormContext, useFormState, useWatch } from 'react-hook-form';

import { CustomSelect } from '../Select';

import { CompareBase } from './CompareBase';

export const SelectComparisonField = ({
    choices,
    label,
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    fieldName,
    ...rest
}) => {
    const { disabled, touchedFields } = useFormState();

    const prevName = `${prevBaseName}.${fieldName}`;
    const currentName = `${currentBaseName}.${fieldName}`;

    const { control } = useFormContext();
    const prevValue = useWatch({ control, name: prevName });
    const currentValue = useWatch({ control, name: currentName });
    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (currentValue && prevValue !== currentValue);

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            {...rest}
            left={<CustomSelect name={prevName} disabled source={prevName} choices={choices} label={label} />}
            right={
                <CustomSelect
                    defaultValue={prevValue}
                    source={currentName}
                    choices={choices}
                    isNew={isChanged}
                    disabled={disabled}
                    label={label}
                />
            }
        />
    );
};
