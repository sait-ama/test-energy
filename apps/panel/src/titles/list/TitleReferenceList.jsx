import { ReferenceManyField } from 'react-admin';

import { Pagination } from '../../common/components/Paginations';

import { TitleDatagrid } from './TitleDatagrid.jsx';

export const TitleReferenceList = ({ target }) => {
    if (!target) return null;

    return (
        <ReferenceManyField label="" reference="titles" target={target} pagination={<Pagination />}>
            <TitleDatagrid />
        </ReferenceManyField>
    );
};
