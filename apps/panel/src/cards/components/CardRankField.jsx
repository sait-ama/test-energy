import { FunctionField } from 'react-admin';

import useCardRankTypes from 'src/hooks/useCardRankTypes.js';

const CardRankField = (props) => {
    const { getNameById, isLoading } = useCardRankTypes();

    if (isLoading) return null;

    return <FunctionField {...props} render={(record) => getNameById(record.rank, 'ranks')} />;
};

export default CardRankField;
