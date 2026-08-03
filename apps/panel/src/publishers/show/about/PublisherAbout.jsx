import { ArrayField, FunctionField, Labeled, TextField, WithListContext } from 'react-admin';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { CustomDatagrid } from '../../../common/components/CustomDatagrid.jsx';
import usePublisherTypes from '../../../hooks/usePublisherTypes.js';
import { replaceHtmlEntities } from '../../../utils/replaceHtmlEntities.js';
import { sanitizeSync } from '../../../utils/sanitize/sanitize-sync.jsx';

export const PublisherAbout = () => {
    const { getNameById, isLoading } = usePublisherTypes();

    if (isLoading) return null;

    return (
        <Box sx={{ padding: 4 }} display="flex" flexDirection="column">
            <Labeled>
                <TextField source="tagline" label="Таглайн: " />
            </Labeled>


            <Labeled>
                <FunctionField label="Описание" render={(record) => (
                    <Typography sx={{wordBreak: 'break-all'}} dangerouslySetInnerHTML={{__html: sanitizeSync(replaceHtmlEntities(record.description ?? ''))}}/>
                )} />
            </Labeled>
            <Labeled>
                <TextField source="admin_comment" label="Комментарий админа: " />
            </Labeled>

            <Divider>Состав</Divider>

            <ArrayField source="users" label="">

                    <CustomDatagrid
                        bulkActionButtons={false}
                        optimized
                        resource="users"
                        rowClick={(resource, id, record) => `/users/${record.user.id}/show`}
                    >
                        <TextField source="user.username" label="Пользователь" />
                        <TextField source="privileges.name" label="Роль" />

                        <ArrayField source="privileges.rights" label="Права">
                            <WithListContext
                                render={({ data }) =>
                                    <ul className="flex gap-1 flex-wrap">
                                        {data.map((it) => getNameById(it, 'rights')).join(', ')}
                                    </ul>
                                } />

                        </ArrayField>
                    </CustomDatagrid>
                </ArrayField>
        </Box>
    );
};
