import React from 'react';
import { FunctionField, useRecordContext } from 'react-admin';

import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

import { getTimeString } from '../../utils/getTimeString';
import { statusToText } from '../utils.js';

export const FeedbackShowHeader = () => {
    const data = useRecordContext();

    if (!data) return null;

    return (
        <>
            <Box p={3} display="flex" alignItems="center">
                <Typography variant="h6" fontWeight="bold">{`Фидбэк #${data.id}`}</Typography>
                <Box className="ml-auto pr-2" textAlign="end">
                    <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                        <Typography color="text.secondary" fontSize={12}>
                            {getTimeString(data.created_at)}
                        </Typography>
                    </Box>
                    <FunctionField render={(record) => (statusToText[record.status])} />

                </Box>
            </Box>
            <Divider variant="fullWidth" />
        </>
    );
};
