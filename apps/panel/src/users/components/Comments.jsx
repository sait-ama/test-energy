import { ReferenceManyField } from 'react-admin';

import { CommentsDatagrid } from '../../comments/components/CommentsDatagrid.jsx';

const Comments = () => {
    return (
        <ReferenceManyField target="user_id" source="id" label="Комментарии" reference="comments">
            <CommentsDatagrid />
        </ReferenceManyField>
    );
};

export default Comments;
