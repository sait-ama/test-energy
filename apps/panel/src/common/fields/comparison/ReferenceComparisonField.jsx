import { cloneElement } from 'react';
import { ReferenceField, ReferenceManyField } from 'react-admin';
import { useFormState } from 'react-hook-form';

import { CompareBase } from './CompareBase.jsx';

export const ReferenceComparisonField = ({
    reference,
    target = 'id',
    children,
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    label,
    fieldName,
    fieldProps,
    many = false,
    ...rest
}) => {
    const { touchedFields } = useFormState();

    const isChanged = !!touchedFields[currentBaseName]?.[fieldName];

    const prevName = `${prevBaseName}.${fieldName}`;
    const currentName = `${currentBaseName}.${fieldName}`;

    const Component = many ? ReferenceManyField : ReferenceField;

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            className="mb-8"
            {...rest}
            left={
                <Component label={label} reference={reference} source={prevName} target={target} {...fieldProps}>
                    {children}
                </Component>
            }
            right={
                <Component label={label} reference={reference} clickable source={currentName} target={target} {...fieldProps}>
                    {cloneElement(children, { isNew: isChanged })}
                </Component>
            }
        />
    );
};
