import React from 'react';
import { useFormState, useWatch } from 'react-hook-form';

import { useFormControl } from '@mui/material';
import DiffMatchPatch from 'diff-match-patch';

import { CustomRichTextInput } from '../RichTextInput.jsx';

import { CompareBase } from './CompareBase';

const dmp = new DiffMatchPatch();

function compareBaseStrings(string1 = '', string2 = '', { showAdded = true, showRemoved = true }) {
    const diffs = dmp.diff_main(String(string1), String(string2));
    dmp.diff_cleanupSemantic(diffs);

    let output = '';
    diffs.forEach(([status, item]) => {
        if (status === -1) {
            if (showRemoved) {
                output += `<strong style="color:red">${item}</strong>`;
            }
        } else if (status === 1) {
            if (showAdded) {
                output += `<strong style="color: green">${item}</strong>`;
            }
        } else {
            output += `<span>${item}</span>`;
        }
    });

    return output;
}

export const htmlRegExp = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/gi;

export const RichTextComparisonField = ({
    hidden,
    prevBaseName = 'title',
    currentBaseName = 'data',
    fieldName,
    label,
    ...rest
}) => {
    const { disabled, touchedFields } = useFormState();
    const control = useFormControl();

    const prevName = `${prevBaseName}.${fieldName}`;
    const prevValue = useWatch({ control, name: prevName, defaultValue: '' });
    const currentName = `${currentBaseName}.${fieldName}`;
    const currentValue = useWatch({
        control,
        name: currentName,
        defaultValue: '',
    });

    const isChanged = !!touchedFields[currentBaseName]?.[fieldName] || (currentValue && currentValue !== prevValue);

    const compare = (options) => compareBaseStrings((prevValue || '').replace(htmlRegExp, ''), (currentValue || '').replace(htmlRegExp, ''), options);

    if (hidden && !isChanged) return null;

    return (
        <div className="flex flex-col items-end">
            <div className="flex w-1/2 pl-[12px]">
                <CustomRichTextInput
                    name={currentName}
                    source={currentName}
                    toolbar={() => null}
                    isNew={isChanged}
                    disabled={disabled}
                    fullWidth
                    label={label}
                />
            </div>

            <div className="w-full">
                <CompareBase
                    {...rest}
                    left={<div dangerouslySetInnerHTML={{ __html: compare({ showAdded: false }) }} />}
                    right={<div dangerouslySetInnerHTML={{ __html: compare({ showRemoved: false }) }} />}
                />
            </div>
        </div>
    );
};
