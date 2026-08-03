import { useFormState, useWatch } from 'react-hook-form';

import { useFormControl } from '@mui/material';

import { getFullUrl } from '../../../utils/getFullUrl.js';
import { CustomImage } from '../ImageField.jsx';

import { CompareBase } from './CompareBase';

export const ImageComparisonField = ({
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    label,
    fieldSx,
    fieldName,
    fieldStyle,
    ...rest
}) => {
    const { touchedFields } = useFormState();
    const control = useFormControl();

    const currentName = `${currentBaseName}.${fieldName}`;
    const curValue = useWatch({ control, name: currentName });
    const isCurrObj = typeof curValue === 'object';
    const resolvedCurrentValue = isCurrObj ? getFullUrl(curValue?.['mid']) : curValue;

    const prevName = `${prevBaseName}.${fieldName}`;
    const prevValue = useWatch({ control, name: prevName });
    const isPrevObj = typeof prevValue === 'object';

    const resolvedPrevValue = isPrevObj ? getFullUrl(prevValue?.['mid']) : prevValue;

    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (curValue && prevValue !== curValue);

    return (
        <CompareBase
            hidden={hidden && !isChanged}
            className="mb-8"
            {...rest}
            left={<CustomImage style={fieldStyle} label={label} src={resolvedPrevValue} sx={fieldSx} />}
            right={
                <CustomImage
                    label={label}
                    style={fieldStyle}
                    src={isChanged ? resolvedCurrentValue : resolvedPrevValue}
                    isNew={isChanged}
                    sx={fieldSx}
                />
            }
        />
    );
};
