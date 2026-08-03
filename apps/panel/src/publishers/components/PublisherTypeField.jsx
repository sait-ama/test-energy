import { FunctionField } from 'react-admin';

import useGetPublisherTypes from 'src/hooks/usePublisherTypes';

const PublisherTypeField = (props) => {
    const { getNameById, isLoading } = useGetPublisherTypes();

    if (isLoading) return null;

    return <FunctionField {...props} render={({ type }) => getNameById(type, 'type')} />;
};

export default PublisherTypeField;
