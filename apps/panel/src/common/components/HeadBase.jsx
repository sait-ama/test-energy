import { Link, useRecordContext } from 'react-admin';

import { Box, Chip, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

import { getFullUrl } from '../../utils/getFullUrl.js';
import { getTimeString } from '../../utils/getTimeString.js';
import { StatusField } from '../fields/StatusField.jsx';

export const HeadBase = ({ StatusFieldComponent = StatusField }) => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <>
            <div className="flex justify-between items-center p-8 w-full">
                <div className="max-w-[40%]">
                    {record.user ? (
                        <Link to={`/users/${record.user?.id}/show`}>
                            <Chip
                                avatar={<Avatar src={getFullUrl(record.user?.avatar)} />}
                                // color="primary"
                                variant="outlined"
                                label={record.user?.username}
                                clickable
                                sx={{ fontSize: 18 }}
                            />
                        </Link>
                    ) : null}

                    <Box py={1} px={0.5} gap={0.5} display="flex" flexWrap="wrap" flexDirection="column">
                        <div>
                            {record.user?.publishers?.map(({ publisher, rights }) => (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        whiteSpace: 'no-wrap',
                                        mr: 1,
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                    component={Link}
                                    to={`/publishers/${publisher.id}/show`}
                                    key={publisher.id}
                                >
                                    {publisher.name}&nbsp;
                                    {rights.includes('can_represent_team') ? <b>(представитель)</b> : ''}
                                    <br />
                                </Typography>
                            ))}
                        </div>

                        <Typography
                            variant="caption"
                            sx={{
                                whiteSpace: 'no-wrap',
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {record.is_publisher_this_title ? 'Переводчик тайтла' : null}
                        </Typography>
                    </Box>
                </div>
                <div className="ml-auto pr-2" style={{ textAlign: 'end' }}>
                    <Typography>
                        {getTimeString(record.date)}
                        {record.moderator && (
                            <span className="ml-4">{`(Модератор: ${record.moderator.username})`}</span>
                        )}
                    </Typography>{' '}
                    <StatusFieldComponent />
                </div>
            </div>
            <Divider variant="fullWidth" />
        </>
    );
};
