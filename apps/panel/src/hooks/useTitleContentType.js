import { useMemo } from 'react';

import useTitleModel from './useTitleModel';

const mapContentType = {
    comics: 'manga',
    book: 'novel',
    movie: 'series',
};

export const useTitleContentType = ({ id }) => {
    const { data, ...rest } = useTitleModel({ id });

    const contentType = useMemo(() => {
        if (!data) return data;

        try {
            const siteValue = data.sites[0];

            const contentType = siteValue?.name.split('_')[0];

            return mapContentType[contentType] || 'manga';
        } catch {
            return 'manga';
        }
    }, [data]);

    return { data: contentType, ...rest };
};
