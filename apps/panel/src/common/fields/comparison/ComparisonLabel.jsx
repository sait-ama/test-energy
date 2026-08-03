import React from 'react';

import Typography from '@mui/material/Typography';

import { CompareBase } from './CompareBase';

export const ComparisonLabel = () => {
    return (
        <CompareBase
            left={
                <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                    }}
                >
                    Старые значения
                </Typography>
            }
            right={
                <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                    }}
                >
                    Новые значения
                </Typography>
            }
            className="mb-2"
        />
    );
};
