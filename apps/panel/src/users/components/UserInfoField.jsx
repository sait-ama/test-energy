import { forwardRef } from 'react';
import { Link, TextField, useRecordContext, WrapperField } from 'react-admin';

import { Box } from '@mui/material';

import UserAvatar from './UserAvatar';

const UserInfoField = forwardRef(
    ({ source, secondaryField = 'email', renderSecondaryField, onClick, clickable = !!onClick, ...rest }, ref) => {
        const record = useRecordContext();

        if (source && !record?.[source]) return null;

        const format = (name) => {
            if (!source) return name;
            return `${source}.${name}`;
        };

        const getRecord = () => {
            return source ? record[source] : record;
        };

        const handleClick = (e) => {
            if (onClick) {
                onClick(e);
                e.preventDefault();
            }
            e.stopPropagation();
        };

        const component = (
            <WrapperField source={source} {...rest}>
                <Box
                    ref={clickable ? undefined : ref}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ...(clickable
                            ? {
                                  p: 0.5,
                                  pr: 1,
                                  m: -0.5,
                                  borderRadius: 2,
                                  '&:hover': {
                                      backgroundColor: 'action.hover',
                                  },
                              }
                            : {}),
                    }}
                >
                    <UserAvatar size={32} />
                    <div className="flex flex-col">
                        <TextField source={format('username')} color="text.primary" fontWeight="bold" />
                        {renderSecondaryField ? (
                            renderSecondaryField(getRecord(record))
                        ) : (
                            <TextField source={format(secondaryField)} color="textSecondary" fontSize={12} />
                        )}
                    </div>
                </Box>
            </WrapperField>
        );

        if (clickable) {
            return (
                <Link
                    ref={ref}
                    target="_blank"
                    to={`/users/${source ? record[source].id : record.id}/show`}
                    onClick={handleClick}
                >
                    {component}
                </Link>
            );
        }

        return component;
    },
);
UserInfoField.displayName = 'UserInfoField';

export default UserInfoField;
