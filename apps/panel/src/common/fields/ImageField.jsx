import { Box, Typography } from '@mui/material';

import { getFullUrl } from '../../utils/getFullUrl.js';
import { getLabelSx } from '../styles/edited.js';

export const CustomImage = (props) => {
    const { src, alt, label, style, ...rest } = props;

    const base64 = src && typeof src === 'string' && src?.startsWith('data:');

    return (
        <Box sx={getLabelSx(props.isNew)} {...rest}>
            {label ? <Typography variant="subtitle1">{label}</Typography> : null}
            <img
                src={base64 ? src : getFullUrl(src)}
                alt={alt}
                style={{
                    height: 'unset !important',
                    // maxWidth: 200,
                    objectFit: 'contain',
                    ...style,
                }}
            />
        </Box>
    );
};
