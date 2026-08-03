import orange from '@mui/material/colors/orange';
import red from '@mui/material/colors/red';

import { statusToIconMap } from '../utils.js';

const rowSx = (record) => {
    let style = {};

    if (!record) {
        return style;
    }

    const resolved = statusToIconMap[record.status];

    if (resolved === 'open')
        return {
            ...style,
            borderLeftColor: orange[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (resolved === 'in_progress')
        return {
            ...style,
            borderLeftColor: 'rgba(59, 130, 246, 0.5)',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (resolved === 'accepted')
        return {
            ...style,
            borderLeftColor: '#419d6f',
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    if (resolved === 'rejected')
        return {
            ...style,
            borderLeftColor: red[500],
            borderLeftWidth: 5,
            borderLeftStyle: 'solid',
        };
    return style;
};

export default rowSx;
