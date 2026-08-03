import React from 'react';
import { ReferenceField, ReferenceManyField, SimpleList, useRecordContext } from 'react-admin';

import { Drawer, Toolbar, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';

import UserInfoField from '../../users/components/UserInfoField.jsx';
import { replaceHtmlEntities } from '../../utils/replaceHtmlEntities.js';
import { sanitizeSync } from '../../utils/sanitize/sanitize-sync.jsx';

import { CommentWithRecordContext } from './../../comments';

const drawerWidth = 340;

const ReportShowAside = () => {
    const record = useRecordContext();

    if (!record || record.type !== 4 || !record.target.model) return null;

    return (
        <Drawer
            variant="persistent"
            open
            anchor="right"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    // borderRadius: "0px !important",
                    // borderWidth: "0px !important",
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar />
            <div style={{ padding: 16, maxWidth: 360, width: '100%' }}>
                <Typography variant="h6" paragrpah mb={1} color="text.secondary" fontWeight="bold">
                    Ветка комментариев
                </Typography>
                {record.target.model.reply_to ? (
                    <>
                        <ReferenceField reference="comments" source="target.model.reply_to">
                            <CommentWithRecordContext />
                        </ReferenceField>
                        <ReferenceManyField
                            sort={{ field: 'id', order: 'ASC' }}
                            reference="comments"
                            target="reply_to_id"
                            source="target.model.reply_to"
                        >
                            <SimpleList
                                primaryText={() => <UserInfoField source="user" />}
                                secondaryText={(record) => (
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeSync(replaceHtmlEntities(record.text)),
                                        }}
                                    />
                                )}
                            />
                        </ReferenceManyField>
                    </>
                ) : (
                    <ReferenceField reference="comments" source="target.model.id">
                        <CommentWithRecordContext />
                    </ReferenceField>
                )}

                <Divider />
                {/*<ReferenceManyField*/}
                {/*    reference="comments"*/}
                {/*    target="reply_to"*/}
                {/*    source={isReply ? 'target.model.reply_to' : 'target.model.id'}*/}
                {/*    sx={{ ml: 1 }}*/}
                {/*>*/}
                {/*    <CommentsIterator />*/}
                {/*</ReferenceManyField>*/}
            </div>
        </Drawer>
    );
};

export { ReportShowAside };
