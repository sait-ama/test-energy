import { Show, SimpleShowLayout } from 'react-admin';

import { HeadBase } from '../../common/components/HeadBase.jsx';

import { CallsStatusField } from './CallsStatusField.jsx';
import { CallsToolbar } from './CallsToolbar.jsx';

export const CallsShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <HeadBase StatusFieldComponent={CallsStatusField} />
                <CallsToolbar />
            </SimpleShowLayout>
        </Show>
    );
};
