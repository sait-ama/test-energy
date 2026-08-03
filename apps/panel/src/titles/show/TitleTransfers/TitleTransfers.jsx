import { ReferenceManyField } from 'react-admin';

import {
    AcceptedRequestTitlePublishersDatagrid,
} from '../../../requests/edit/title-change-publisher/RequestTitlePublishersTransfer';

export const TitleTransfers = () => {
    return (
        <ReferenceManyField reference="requests" target="title_id" source="id" filter={{
            status: '2_accepted',
            type: 'title_change_publisher',
        }}>
            <AcceptedRequestTitlePublishersDatagrid />
        </ReferenceManyField>
    );
};