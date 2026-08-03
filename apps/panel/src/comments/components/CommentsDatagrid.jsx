import { BooleanField, DateField, FunctionField, NumberField, TextField } from 'react-admin';

import Typography from '@mui/material/Typography';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import UserInfoField from '../../users/components/UserInfoField.jsx';
import { replaceHtmlEntities } from '../../utils/replaceHtmlEntities.js';
import { sanitizeSync } from '../../utils/sanitize/sanitize-sync.jsx';

import { CommentScoreField } from './CommentScoreField.jsx';

export const CommentsDatagrid = (props) => {
    return (
        <CustomDatagrid rowClick="edit" {...props} bulkActionButtons={false}>
            <UserInfoField sortable={false} source="user" />
            <FunctionField render={(record) => (
                <Typography sx={{ wordBreak: 'break-all' }}
                            dangerouslySetInnerHTML={{ __html: sanitizeSync(replaceHtmlEntities(record.text)) }} />
            )} />
            <CommentScoreField sortable={false} source="score" label="Оценка" />
            <TextField sortable={false} source="count_replies" label="Ответов" />
            <BooleanField sortable={false} source="is_blocked" label="Заблокирован" />
            <BooleanField sortable={false} source="is_deleted" label="Удален" />
            <DateField sortable={false} source="date" label="Дата создания" />
            <NumberField sortable={false} source="id" />
        </CustomDatagrid>
    );
};
