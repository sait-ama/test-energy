import { useRecordContext } from 'react-admin';
import { useWatch } from 'react-hook-form';

import Divider from '@mui/material/Divider';

import { AcceptButton } from '../../common/components/AcceptButton';

const approveBodyParams = { action: 'done' };
const isInWorkBodyParams = { action: 'select' };
const declineBodyParams = { action: 'decline' };
// const deleteBodyParams = { action: 'delete' };

// status 0 - open, 1 - pinned, 2 - accepted, 3 - declined

export const ReportShowFooter = () => {
    const record = useRecordContext();

    const { moderator_message } = useWatch();

    if (!record || record.status >= 2) return null;

    const getBodyParams = (params) => ({ moderator_message, ...params });

    return (
        <>
            <Divider light variant={'fullWidth'} />
            <div className={'flex p-8 w-full justify-between'}>
                <div className="flex gap-2">
                    <AcceptButton
                        resource="reports"
                        bodyParams={getBodyParams(declineBodyParams)}
                        record={record}
                        redirectTo={'/reports'}
                        notifyTextSuccess={'Репорт успешно отклонен'}
                        notifyTextFail={'Репорт не отклонен'}
                        buttonText={'Отклонить'}
                        color={'error'}
                        disabled={record.status !== 1}
                    />
                </div>
                <div className="flex gap-2">
                    <AcceptButton
                        resource="reports"
                        bodyParams={isInWorkBodyParams}
                        record={record}
                        //    redirectTo={'/reports'}
                        notifyTextSuccess={'Репорт успешно принят'}
                        notifyTextFail={'Репорт не принят'}
                        buttonText={record.status == 1 ? 'В работе' : 'В работе'}
                        color={'primary'}
                        disabled={record.status !== 0}
                        style={{ marginRight: 8 }}
                    />
                    <AcceptButton
                        resource="reports"
                        bodyParams={getBodyParams(approveBodyParams)}
                        record={record}
                        redirectTo={'/reports'}
                        notifyTextSuccess={'Репорт успешно принят'}
                        notifyTextFail={'Репорт не принят'}
                        buttonText={'Принять'}
                        color={'success'}
                        disabled={record.status !== 1}
                    />
                </div>
            </div>
        </>
    );
};
