import { forwardRef } from 'react';
import { FunctionField, Link, TextField, useRecordContext, WrapperField } from 'react-admin';

import ReplyIcon from '@mui/icons-material/Reply';
import { Box } from '@mui/material';

import { customPick } from '../../utils/customPick.js';

import CharacterAvatar from './CharacterAvatar';

const CharacterInfoField = forwardRef(
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
                        justifyContent: 'space-between',
                        gap: 1,
                        ...(clickable
                            ? {
                                  p: 0.5,
                                  m: -0.5,
                                  borderRadius: 2,
                                  '&:hover': {
                                      backgroundColor: 'action.hover',
                                  },
                              }
                            : {}),
                    }}
                >
                    <Box sx={{display: 'flex', gap: 2}}>
                        <CharacterAvatar size={32} />
                        <div className="flex flex-col">
                            <TextField source={format('name')} color="text.primary" fontWeight="bold" />
                            {renderSecondaryField ? (
                                renderSecondaryField(getRecord(record))
                            ) : (
                                <TextField source={format(secondaryField)} color="textSecondary" fontSize={12} />
                            )}
                        </div>
                    </Box>

                    <FunctionField
                        render={(record) => (
                            <Link to={`${import.meta.env.VITE_URL}/character/${customPick(record, (format('id')))}`} target="_blank">
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
                    ref={ref}
                    target="_blank"
                    to={`/characters/${source ? record[source].id : record.id}/show`}
                    onClick={handleClick}
                >
                    {component}
                </Link>
            );
        }

        return component;
    },
);
CharacterInfoField.displayName = 'CharacterInfoField';

export default CharacterInfoField;
