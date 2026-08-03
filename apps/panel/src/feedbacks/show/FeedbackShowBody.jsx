import React from 'react';
import { useRecordContext, useResourceContext } from 'react-admin';

import { Box } from '@mui/material';
import cx from 'clsx';

import { AcceptButton } from '../../common/components/AcceptButton.jsx';
import UserInfoField from '../../users/components/UserInfoField.jsx';
import { getType } from '../utils.js';

import classes from '../Feedbacks.module.css';


const approveBodyParams = { status: 3 };
const isInWorkBodyParams = { status: 2 };
const declineBodyParams = { status: 4 };


export const FeedbackShowBody = () => {
    const record = useRecordContext();
    const resource = useResourceContext();

    if (!record) return null;

    return (
        <Box p={4}>
            <div className={classes.row}>
                <div className={classes.rowContent}>
                    <div className={classes.rowContentName}>{`Топик:`}</div>
                    <div className={classes.rowContentValue}>{record.topic}</div>
                </div>
            </div>
            <div className={classes.row}>
                <div className={cx(classes.rowContent, 'mb-0')}>
                    <div className={classes.rowContentName}>{`Тип:`}</div>
                    <div className={classes.rowContentValue}>{getType(record.type)}</div>
                </div>
            </div>
            <div className={classes.row}>
                <div className={cx(classes.rowContent, 'mb-0')}>
                    <div className={classes.rowContentName}>Пользователь</div>
                    <UserInfoField source={'user'} />
                    {/*<Dolboyeb type={data.type} model={data.user} />*/}
                </div>
            </div>
            <div className={classes.row}>
                <div className={classes.rowContent}>
                    <div className={classes.rowContentName}>{`Сообщение:`}</div>
                    <div className={classes.rowContentValue}>{record.description ?? '-'}</div>
                </div>
            </div>

            <div className={'flex p-8 w-full justify-between'}>
                {record.status === 1 && <div className="flex gap-2">
                    <AcceptButton
                        resource={resource}
                        bodyParams={{
                            ...record,
                            user: record.user?.id,
                            description: record.description ?? 'a',
                            ...isInWorkBodyParams,
                        }}
                        record={record}
                        notifyTextSuccess="Заявка отклонена"
                        notifyTextFail="Произошла ошибка"
                        buttonText="В работу"
                        color="success"
                    />
                </div>}
                {record.status === 2 &&
                    <>
                        <div className="flex gap-2">
                            <AcceptButton
                                resource={resource}
                                bodyParams={{
                                    ...record,
                                    user: record?.user?.id,
                                    description: record.description ?? 'a',

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
                                    ...record,
                                    user: record?.user?.id,
                                    description: record.description ?? 'a',
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
                    </>
                }
            </div>
        </Box>
    );
};
