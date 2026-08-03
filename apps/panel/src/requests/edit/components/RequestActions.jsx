import { useRecordContext, useResourceContext } from 'react-admin';

import Divider from '@mui/material/Divider';

import { AcceptButton } from '../../../common/components/AcceptButton';

const approveBodyParams = { submit: true };
const declineBodyParams = { submit: false };

// status 0 - open, 1 - pinned, 2 - accepted, 3 - declined

export const RequestActions = ({ /* resource = 'requests' , */ additionalBodyParams }) => {
    const record = useRecordContext();
    const resource = useResourceContext();

    if (!record || record.status !== '1_open') return null;

    //  const status = record.request.status;

    return (
        <>
            <Divider light variant="fullWidth" />
            <div className={'flex p-8 w-full justify-between'}>
                <div className="flex gap-2">
                    <AcceptButton
                        resource={resource}
                        bodyParams={{
                            ...additionalBodyParams,
                            ...declineBodyParams,
                        }}
                        record={record}
                        redirectTo={`/${resource}`}
                        notifyTextSuccess="Заявка отклонена"
                        notifyTextFail="Произошла ошибка"
                        buttonText="Отклонить"
                        color="error"
                    />
                </div>
                <div className="flex gap-2">
                    <AcceptButton
                        resource={resource}
                        bodyParams={{
                            ...additionalBodyParams,
                            ...approveBodyParams,
                        }}
                        record={record}
                        redirectTo={`/${resource}`}
                        notifyTextSuccess="Заявка принята"
                        notifyTextFail="Произошла ошибка"
                        buttonText="Принять"
                        color="success"
                    />
                </div>
            </div>
        </>
    );
};
