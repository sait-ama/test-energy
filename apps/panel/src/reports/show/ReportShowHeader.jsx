import { useRecordContext } from 'react-admin';

import { Box, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

import { getTimeString } from '../../utils/getTimeString';

export const ReportShowHeader = () => {
    const data = useRecordContext();

    if (!data) return null;

    return (
        <>
            <Box p={3} display="flex" alignItems="center">
                <Typography variant="h6" fontWeight="bold">{`Репорт #${data.id}`}</Typography>
                <Box className="ml-auto pr-2" textAlign="end">
                    <Box display="flex" flexDirection="row" gap={2} alignItems="center">
                        <Typography variant="body2" fontWeight="bold" color="text.secondary">
                            {data.moderator && `Модератор: ${data.moderator.username}`}
                        </Typography>
                        <Typography color="text.secondary" fontSize={12}>
                            {getTimeString(data.date)}
                        </Typography>
                    </Box>


                </Box>
            </Box>
            <Divider variant="fullWidth" />
        </>
    );
};
