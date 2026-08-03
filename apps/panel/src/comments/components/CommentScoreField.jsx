import { useRecordContext } from 'react-admin';

import { Box, Typography } from '@mui/material';

export const CommentScoreField = ({ source = 'score' }) => {
    const record = useRecordContext();
    if (!record) return null;

    const isMinus = record[source] < 0;

    return (
        <Box alignItems="center" display="flex" flexDirection="row" gap={1}>
            <Typography color={isMinus ? 'error.main' : 'success.main'} fontWeight="bold" fontSize={14}>
                {record[source]}
            </Typography>
            {/*<Typography fontSize={12} >{isMinus ? "👎" : "👍"}</Typography>*/}
        </Box>
    );
};
