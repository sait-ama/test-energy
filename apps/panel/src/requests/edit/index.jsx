import { Edit, WithRecord } from 'react-admin';

import { RequestCardAdd } from './card-add/CardAdd.jsx';
import { RequestCardUpdate } from './card-update/CardUpdate.jsx';
import { RequestCharacterAdd } from './character-add/CharacterAdd.jsx';
import { RequestCharacterUpdate } from './character-update/CharacterUpdate.jsx';
import Aside from './components/RequestAside';
import { RequestCreatorAdd } from './creator-add/RequestCreatorAdd';
import { RequestCreatorEdit } from './creator-update/RequestCreatorUpdate';
import { RequestMomentAdd } from './moment-add/RequestMomentAdd';
import { RequestMomentUpdate } from './moment-update/RequestMomentUpdate';
import { RequestTeamAdd } from './publisher-add/RequestTeamAdd';
import { ShopImageItemAdd } from './shop-image-item-add/ShopImageItemAdd.jsx';
import { RequestTitleAdd } from './title-add/RequestTitleAdd';
import { RequestTitleAdditionalAdd } from './title-add-additional/TitleAdditionalAdd.jsx';
import { RequestTitlePublishersTransfer } from './title-change-publisher/RequestTitlePublishersTransfer';
import { RequestTitleNewSeason } from './title-new-season/RequestTitleNewSeason';
import { RequestRelatedTitlesAdd } from './title-relation-add/RequestRelatedTitlesAdd.jsx';
import { RequestRelatedTitlesUpdate } from './title-relation-update/RequestRelatedTitlesUpdate.jsx';
import { RequestTitleEdit } from './title-update/RequestTitleEdit';
import { RequestTitleAdditionalUpdate } from './title-update-additional/TitleAdditionalUpdate.jsx';
import { RequestTitleUpdateCreator } from './title-update-creator/TitleUpdateCreator.jsx';
import { BaseRequestLayout } from './BaseLayout';

const requestType = (type) => {
    if (type === 'title_update') return RequestTitleEdit;
    if (type === 'title_add') return RequestTitleAdd;
    if (type === 'publisher_add') return RequestTeamAdd;
    if (type === 'title_change_publisher') return RequestTitlePublishersTransfer;
    if (type === 'title_new_season') return RequestTitleNewSeason;
    if (type === 'creator_add') return RequestCreatorAdd;
    if (type === 'creator_update') return RequestCreatorEdit;
    if (type === 'title_additional_add') return RequestTitleAdditionalAdd;
    if (type === 'title_additional_update') return RequestTitleAdditionalUpdate;
    if (type === 'character_add') return RequestCharacterAdd;
    if (type === 'character_update') return RequestCharacterUpdate;
    if (type === 'card_item_add') return RequestCardAdd;
    if (type === 'card_item_update') return RequestCardUpdate;
    if (type === 'title_relation_add') return RequestRelatedTitlesAdd;
    if (type === 'title_relation_update') return RequestRelatedTitlesUpdate;
    if (type === 'shop_image_item_add') return ShopImageItemAdd;
    if (type === 'moment_add') return RequestMomentAdd;
    if (type === 'moment_update') return RequestMomentUpdate;
    if (type === 'title_add_creators') return RequestTitleUpdateCreator;
    if (type === 'title_update_creators') return RequestTitleUpdateCreator;

    return () => 'такого типа нет, пиздец';
};

const RequestEdit = () => {
    return (
        <Edit aside={<Aside />}>
            <WithRecord
                render={(record) => {
                    if (!record) return null;

                    const Component = requestType(record.type);

                    return (
                        <BaseRequestLayout defaultValues={record}>
                            <Component />
                        </BaseRequestLayout>
                    );
                }}
            />
        </Edit>
    );
};

export default RequestEdit;
