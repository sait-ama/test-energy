import { useFormContext, useFormState, useWatch } from 'react-hook-form';

import { BooleanInput } from 'ra-ui-materialui';

import { CompareBase } from './CompareBase';

export const BooleanComparisonField = ({
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    fieldName,
    label,
    ...rest
}) => {
    const { control } = useFormContext();
    const { disabled, touchedFields } = useFormState();

    const prevName = `${prevBaseName}.${fieldName}`;
    const currentName = `${currentBaseName}.${fieldName}`;

    const prevValue = useWatch({ control, name: prevName });
    const currentValue = useWatch({ control, name: currentName });
    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (currentValue && prevValue !== currentValue);

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            {...rest}
            left={<BooleanInput source={prevName} disabled label={label} size="small" />}
            // right={
            //     <BooleanInput
            //         source={isChanged ? currentName : prevName}
            //         disabled={disabled}
            //         label={label}
            //         size="small"
            //     />
            // }
            right={
                <BooleanInput
                    defaultValue={prevValue}
                    source={currentName}
                    disabled={disabled}
                    label={label}
                    size="small"
                />
            }
        />
    );
};
