import { List, NumberField, SearchInput } from 'react-admin';

import CardInfoField from 'src/cards/components/CardInfoField.jsx';
import CardRankField from 'src/cards/components/CardRankField.jsx';
import { Pagination } from 'src/common/components/Paginations';
import TitleInfoField from 'src/titles/common/TitleInfoField.jsx';
import { UserInfoWithDetailsPopover } from 'src/users/components/UserInfoWithDetailsPopover.jsx';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';

const rowStyle = () => ({
    //    backgroundColor: '#1e1e1e',
    //    marginTop: '20px',
    //    border: 0,
    //    borderRadius: '10px',
});

export const CardsList = () => {
    // const location = useLocation();
    // const navigate = useNavigate();

    return (
        <List
            filters={[<SearchInput source="search" alwaysOn name="search" autoComplete="false" />]}
            perPage={20}
            exporter={false}
            actions={null}
            style={{ width: '100%' }}
            pagination={<Pagination />}
            sx={{
                flexGrow: 1,
                transition: (theme) =>
                    theme.transitions.create(['all'], {
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                // marginRight: match ? '400px' : 0, // убираем сдвиг под Drawer
            }}
        >
            <CustomDatagrid optimized rowClick="show" rowStyle={rowStyle} bulkActionButtons={false}>
                <CardInfoField label="Карточка" renderSecondaryField={() => null} />
                <CardRankField source="rank" label="Ранг" />
                <TitleInfoField
                    clickable={true}
                    source="title"
                    label="Тайтл"
                    containerProps={{ sx: { maxWidth: '600px' } }}
                />
                <UserInfoWithDetailsPopover source="author" label="Автор" />
                <NumberField source="id" />
            </CustomDatagrid>
        </List>
    );
};
