import { useState } from 'react';
import { BooleanInput, Form, useRecordContext, useResourceContext, useUpdate } from 'react-admin';

import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, IconButton, Typography } from '@mui/material';

import { CustomTextInput } from '../../common/fields/TextInput.jsx';
import { replaceHtmlEntities } from '../../utils/replaceHtmlEntities.js';
import { sanitizeSync } from '../../utils/sanitize/sanitize-sync.jsx';

export const CommentWithRecordContext = () => {
    const comment = useRecordContext();

    if (!comment) return null;

    return <Comment comment={comment} />;
};

export const Comment = (props) => {
    const { comment } = props;

    const [isHover, setHover] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const resource = useResourceContext();

    const [update] = useUpdate();

    const handleEnterEditMode = () => {
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setHover(false);
    };

    const handleCommentUpdate = (data) => {
        update(
            resource,
            {
                id: comment.id,
                data: {
                    text: data.text,
                    is_blocked: data.is_blocked,
                    is_spoiler: data.is_spoiler,
                },
                previousData: comment,
            },
            {
                onSuccess: () => {
                    setEditing(false);
                    setHover(false);
                },
                onError: (error) => {
                    console.log(error);
                },
            },
        );
    };

    return (
        <Box mb={2} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <Box px={0.5} color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" variant="body2">
                    <b>{comment.user?.username}</b>{' '}
                </Typography>
                {/*<DateField*/}
                {/*    sx={{ ml: 'auto' }}*/}
                {/*    source="created_at"*/}
                {/*    record={comment}*/}
                {/*    variant="caption"*/}
                {/*    showTime*/}
                {/*/>*/}
                <Box
                    sx={{
                        mt: 0.5,
                        ml: 'auto',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        // justifyContent: 'space-around',
                        visibility: isHover ? 'visible' : 'hidden',
                        // position: 'absolute',
                        // right: 0,
                        // top: 0,
                    }}
                >
                    <IconButton size="small" onClick={handleEnterEditMode}>
                        <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    {/*<IconButton size="small" onClick={handleDelete}>*/}
                    {/*    <TrashIcon sx={{ fontSize: 16 }}/>*/}
                    {/*</IconButton>*/}
                </Box>
            </Box>
            {isEditing ? (
                <Form
                    onSubmit={handleCommentUpdate}
                    defaultValues={{ ...comment, text: sanitizeSync(replaceHtmlEntities(comment.text)) }}
                >
                    <CustomTextInput sx={{ wordBreak: 'break-all' }} fullWidth multiline source="text" />
                    <Box flexDirection="column" display="flex">
                        <Box display="flex">
                            <BooleanInput source="is_blocked" name="is_blocked" size="small" label="Забанен" />
                            <BooleanInput source="is_spoiler" name="is_spoiler" size="small" label="Спойлер" />
                        </Box>
                        <Box display="flex" gap={2}>
                            <Button size="small" onClick={handleCancelEdit} color="primary">
                                Отмена
                            </Button>
                            <Button size="small" type="submit" color="primary" variant="contained">
                                Сохранить
                            </Button>
                        </Box>
                    </Box>
                </Form>
            ) : (
                <>
                    <Box
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.1)',
                            padding: '4px 12px 4px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'stretch',
                            marginBottom: 1,
                            position: 'relative',
                        }}
                    >
                        <Box
                            component="p"
                            fontFamily="fontFamily"
                            fontSize="body2.fontSize"
                            lineHeight={1.3}
                            mt={1}
                            sx={{ wordBreak: 'break-all' }}
                            dangerouslySetInnerHTML={{ __html: sanitizeSync(replaceHtmlEntities(comment.text)) }}
                        />
                    </Box>
                    <Box display="flex" fontSize={12} px={0.5} color="text.secondary" flexDirection="row" gap={1}>
                        <span>👍 {comment.score}</span>
                        {comment.count_replies > 0 && <span>Ответов: {comment.count_replies}</span>}
                    </Box>
                </>
            )}
        </Box>
    );
};
