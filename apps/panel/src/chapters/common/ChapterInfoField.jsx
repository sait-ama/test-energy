import { FunctionField, Link, TextField, useRecordContext, WrapperField } from 'react-admin';

import ReplyIcon from '@mui/icons-material/Reply';
import { Box } from '@mui/material';

import { customPick } from '../../utils/customPick.js';

const ChapterInfoField = ({ source, onClick, clickable = !!onClick, isNew, containerProps = {}, ...rest }) => {
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
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                        }}
                    >
                        <TextField source={format('chapter')} />
                    </Box>
                    <div className="flex flex-col">
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField source={format('name')} fontWeight="semibold" color="textPrimary" />
                            <TextField
                                source={format('tome')}
                                color="textSecondary"
                                render={(record) => (record.tome ? `Том ${record.tome}` : null)}
                            />
                        </Box>
                        <Box display="flex" gap={1} alignItems="center">
                            <TextField
                                source={format('title.main_name')}
                                color="textSecondary"
                                className="line-clamp-1"
                            />
                            <TextField
                                source={format('score')}
                                color="textSecondary"
                                render={(record) => (record.score ? `★ ${record.score}` : null)}
                            />
                        </Box>
                    </div>
                </Box>
                <FunctionField
                    render={(record) => (
                        <Link
                            to={`${import.meta.env.VITE_URL}/chapter/${customPick(record, format('dir'))}`}
                            target="_blank"
                        >
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
                to={`/chapters/${source ? value.id : record.id}/show`}
                onClick={handleClick}
                sx={{ width: '100%' }}
            >
                {component}
            </Link>
        );
    }

    return component;
};

export default ChapterInfoField;
