import { useEffect, useRef } from 'react';
import { useRecordContext } from 'react-admin';
import { useFormContext } from 'react-hook-form';

const baseName = 'data';

export const useTouchChangedFields = (source = 'changed_fields') => {
    const rerenderRef = useRef(0);
    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();

    useEffect(() => {
        if (!record?.[source]?.length || rerenderRef.current >= 3) return;
        // Не знаю почему, но touched field становится реально touched только после 2-го раза
        rerenderRef.current += 1;
        for (const field of record[source]) {
            const fieldName = `${baseName}.${field}`;
            setValue(fieldName, getValues(fieldName), {
                shouldTouch: true,
                shouldDirty: true,
            });
        }
    }, [record, rerenderRef.current]);
};
