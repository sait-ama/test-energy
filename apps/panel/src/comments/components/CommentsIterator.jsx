import { useListContext } from 'react-admin';

import { Box } from '@mui/material';
import { Comment } from 'src/comments/components/Comment.jsx';

export const CommentsIterator = ({ showStatus, reference }) => {
    const { data, isLoading } = useListContext();

    if (isLoading || !data?.length) return null;

    return (
        <>
            <Box mt={1} sx={{ width: '100%' }}>
                {data.map((comment, index) => (
                    <Comment
                        comment={comment}
                        isLast={index === data.length - 1}
                        showStatus={showStatus}
                        reference={reference}
                        key={index}
                    />
                ))}
            </Box>
        </>
    );
};
