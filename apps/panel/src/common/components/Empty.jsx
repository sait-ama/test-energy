import { Box, Typography } from '@mui/material';

export const Empty = () => {
    return (
        <Box textAlign="center" m={2}>
            <Typography variant="h6" paragraph>
                Пусто
            </Typography>
        </Box>
    );
};
