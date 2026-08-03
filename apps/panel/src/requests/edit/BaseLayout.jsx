import { useEffect } from 'react';
import {Form, Labeled, TextField, useRecordContext} from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';

import { HeadBase } from '../../common/components/HeadBase.jsx';
import { ModeratorMessageField } from '../../common/fields/ModeratorMessageField';

import { RequestActions } from './components/RequestActions';

const WrappedRequestActions = (props) => {
    const { data, moderator_message } = useWatch();

    return (
        <RequestActions
            {...props}
            additionalBodyParams={{
                data: Object.fromEntries(
                    Object.entries(data ?? {}).filter(([key, value]) => {
                        return !(key === 'cover' && value.startsWith('https://'));
                    }),
                ),
                moderator_message,
            }}
        />
    );
};

export const FallbackFix = () => {
    const { reset } = useFormContext();
    const record = useRecordContext();

    useEffect(() => {
        if (!record) return;
        reset(record);
    }, [record]);
};

export const BaseRequestLayout = (props) => {
    const { children } = props;
    const record = useRecordContext();

    if (!record) return null;

    return (
        <Form disabled={record && record.status !== '1_open'} defaultValues={record}>
            <HeadBase />
            <FallbackFix />
            <div className="flex w-full mt-6 px-8 flex-col">
                {children}
                {/*<TextField label="Комментарий пользователя" source="user_message" variant="body1" sx={{ mb: 1 }} />*/}

                <Labeled>
                    <TextField source="user_message" label="Комментарий пользователя"/>

                </Labeled>
                <ModeratorMessageField baseName="requests" />
            </div>
            <WrappedRequestActions />
        </Form>
    );
};
