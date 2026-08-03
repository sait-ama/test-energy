import { FunctionField } from 'react-admin';

import useTitleTypes from 'src/hooks/useTitleTypes.js';

const TitleFieldWithFormName = (props) => {
    const { fieldName, source, ...rest } = props;
    const { getNameById, isLoading } = useTitleTypes();

    if (!source || isLoading) return null;

    return <FunctionField {...rest} render={(record) => getNameById(record[source], fieldName ?? source)} />;
};

export default TitleFieldWithFormName;
