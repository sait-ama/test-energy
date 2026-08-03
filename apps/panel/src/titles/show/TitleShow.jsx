import { useCallback } from 'react';
import { FunctionField, Labeled, NumberField, Show, Tab, TabbedShowLayout, TextField, useRecordContext } from 'react-admin';

import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import { useTitleContentType } from 'src/hooks/useTitleContentType';

import { LinkUpdater } from '../../common/components/LinkUpdater';
import TitleAvatar from '../common/TitleAvatar';

import { TitleAbout } from './about/TitleAbout';
import { TitleTransfers } from './TitleTransfers/TitleTransfers';
import Aside from './TitleAside';

export const getAgeLimitRange = (ageLimit) => {
    const ageLimits = {
        0: '0+',
        1: '16+',
        2: '18+',
    };

    return ageLimits[ageLimit] ?? '';
};

const TitleLinkUpdater = () => {
    const recordContext = useRecordContext('title');
    const { data: contentType, isLoading } = useTitleContentType({ id: recordContext?.id });

    const linksUpdateSelector = useCallback(
        (record) => (state) => ({
            ...state,
            link: `/${contentType}/${record?.dir}`,
            adminLink: `/admin/titles/title/${record?.id}`,
        }),
        [contentType]
    );

    if (isLoading) return null;

    return <LinkUpdater selector={linksUpdateSelector} />;
};

const TitleShow = () => {
    return (
        <Show aside={<Aside />}>
            <TitleLinkUpdater />
            <Box display="flex" gap={2} m={3}>
                <TitleAvatar />
                <Box display="flex" flexDirection="column" sx={{ width: '100%' }}>
                    <TextField source="another_name" color="textSecondary" />
                    <Box display="flex" gap={1} mb={0.5} alignItems="center">
                        <TextField source="main_name" variant="h5" />
                        <FunctionField
                            render={({ avg_rating, count_rating }) =>
                                avg_rating && count_rating ? `${avg_rating} (${count_rating})` : null
                            }
                            color="textSecondary"
                        />
                    </Box>

                    <Box gap={2} pt={0.5} display="flex" flexDirection="row" fullWidth>
                        <Labeled>
                            <NumberField source="total_views" label="Просмотров" />
                        </Labeled>
                        <Labeled>
                            <NumberField source="total_votes" label="Лайков" />
                        </Labeled>
                        <Labeled>
                            <NumberField source="count_chapters" label="Глав" />
                        </Labeled>
                        <Labeled>
                            <NumberField source="count_bookmarks" label="Закладок" />
                        </Labeled>
                        <Divider orientation="vertical" />
                        <Labeled>
                            <TextField source="issue_year" label="Год" />
                        </Labeled>
                        <Labeled>
                            <FunctionField
                                render={({ age_limit }) => getAgeLimitRange(age_limit)}
                                label="Возрастное ограничение"
                            />
                        </Labeled>
                    </Box>
                </Box>
            </Box>
            <TabbedShowLayout sx={{ '& .RaTabbedShowLayout-content': { padding: 0 } }}>
                <Tab label="Общее">
                    <TitleAbout />
                </Tab>
                <Tab label="Передачи">
                    <TitleTransfers />
                </Tab>
            </TabbedShowLayout>
        </Show>
    );
};

export default TitleShow;
