import * as React from 'react';
import { ReferenceManyField, ShowBase } from 'react-admin';

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { CommentWithRecordContext } from 'src/comments/components/Comment.jsx';
import { CommentsIterator } from 'src/comments/components/CommentsIterator.jsx';

const CommentShow = ({ id, onClose }) => {
    return (
        <ShowBase id={id}>
            <Box pt={8} px={2} width={{ xs: '100vW', sm: 400 }} mt={{ xs: 2, sm: 1 }}>
                <Stack direction="row" mb={1}>
                    <Typography variant="h6" flex="1">
                        Комментарий
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                <CommentWithRecordContext />
                <Divider sx={{ my: 2 }}>Ответы / Ветка</Divider>
                <ReferenceManyField reference="comments" target="reply_to_id">
                    <CommentsIterator />
                </ReferenceManyField>
            </Box>
        </ShowBase>
    );
};

export default CommentShow;
