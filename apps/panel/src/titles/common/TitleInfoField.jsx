import { FunctionField, Link, TextField, useRecordContext, WrapperField } from 'react-admin';

import ReplyIcon from '@mui/icons-material/Reply';
import { Box } from '@mui/material';

import { customPick } from '../../utils/customPick.js';

import TitleAvatar from './TitleAvatar';

const TitleInfoField = ({ source, onClick, clickable = !!onClick, isNew, containerProps = {}, ...rest }) => {
    const record = useRecordContext();

    const value = source && customPick(record, source);

    if (source && (typeof value === 'undefined' || value === null)) return null;

    const format = (name) => {
        if (!source) return name;
        return `${source}.${name}`;
    };

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
            e.preventDefault();
        }
        e.stopPropagation();
    };

    const containerSx = {
        width: '100%',
        maxWidth: '600px',
        border: `1px solid ${isNew ? '#3eb683' : 'text.primary'}`,
        ...(clickable
            ? {
                borderRadius: 1,
                pr: 1,
                '&:hover': {
                    backgroundColor: 'action.hover',
                },
            }
            : {}),
        ...(containerProps.sx || {}),
    };

    const component = (
        <WrapperField source={source} {...rest}>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                {...containerProps}
                sx={containerSx}
            >
                <Box sx={{display: 'flex', gap: 2}}>
                    <TitleAvatar record={value} width={32} />
                    <div className="flex flex-col">
                        <TextField source={format('main_name')} fontWeight="semibold" color="textPrimary" />
                        <TextField source={format('another_name')} color="textSecondary" className="line-clamp-2" />
                    </div>
                </Box>
                <FunctionField
                    render={(record) => (
                        <Link to={`${import.meta.env.VITE_URL}/manga/${customPick(record, (format('dir')))}`} target="_blank">
                            <ReplyIcon />
                        </Link>
                    )}
                />
            </Box>
        </WrapperField>
    );

    if (clickable) {
        return (
            <Link
                target="_blank"
                to={`/titles/${source ? value.id : record.id}/show`}
                onClick={handleClick}
                sx={{ width: '100%' }}
            >
                {component}
            </Link>
        );
    }

    return component;
};

export default TitleInfoField;
