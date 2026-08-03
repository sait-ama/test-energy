import { useFormContext, useFormState, useWatch } from 'react-hook-form';

import { CustomTextInput } from '../TextInput';

import { CompareBase } from './CompareBase';

export const TextComparisonField = ({
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    fieldName,
    label,
    ...rest
}) => {
    const {control} = useFormContext()
    const { disabled, touchedFields } = useFormState();

    const prevName = `${prevBaseName}.${fieldName}`;
    const currentName = `${currentBaseName}.${fieldName}`;

    const prevValue = useWatch({control, name: prevName})
    const currentValue = useWatch({control, name: currentName})
    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (currentValue && prevValue !== currentValue);

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            {...rest}
            left={<CustomTextInput source={prevName} disabled label={label} />}
            right={
                <CustomTextInput
                    isNew={isChanged}
                    defaultValue={prevValue}
                    source={currentName}
                    disabled={disabled}
                    label={label}
                />
            }
        />
    );
};
