import { Link, TextField, useRecordContext, WrapperField } from 'react-admin';

import { Box } from '@mui/material';
import PublisherAvatar from 'src/publishers/components/PublisherAvatar';

const PublisherInfoField = ({ source, clickable = false, ...rest }) => {
    const record = useRecordContext();

    if (source && !record[source]) return null;

    const format = (name) => {
        if (!source) return name;
        return `${source}.${name}`;
    };

    const component = (
        <WrapperField source={source} {...rest}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PublisherAvatar size={32} />
                <div className="flex flex-col">
                    <TextField source={format('name')} fontWeight="semibold" />
                </div>
            </Box>
        </WrapperField>
    );

    if (clickable) {
        return (
            <Link target="_blank" to={`/publishers/${source ? record[source].id : record.id}/show`}>
                {component}
            </Link>
        );
    }

    return component;
};

export default PublisherInfoField;
