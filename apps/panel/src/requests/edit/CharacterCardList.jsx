import React from 'react';
import { Labeled, Loading, ShowBase, TextField,useDataProvider, useNotify } from 'react-admin';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Card, CardMedia, Drawer, IconButton, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import CardAvatar from 'src/cards/components/CardAvatar.jsx';
import CardRankField from 'src/cards/components/CardRankField.jsx';
import TitleInfoField from 'src/titles/common/TitleInfoField.jsx';
import UserInfoField from 'src/users/components/UserInfoField.jsx';

import { getFullUrl } from '../../utils/getFullUrl.js';

const CharacterCardField = ({ id }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [rankCards, setRankCards] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const [previewedCard, setPreviewedCard] = React.useState(null);

    React.useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchCharacterCards = async (characterId) => {
            try {
                const { data } = await dataProvider.getList('cards', {
                    filter: {
                        character_id: characterId,
                    },
                    pagination: { page: 1, perPage: 10000 },
                    sort: { field: 'id', order: 'ASC' },
                });

                const rankCardsData = {
                    rank_a: [],
                    rank_b: [],
                    rank_c: [],
                    rank_d: [],
                    rank_e: [],
                    rank_f: [],
                };

                data.forEach((card) => {
                    const rank = card.rank || 'unknown';
                    const cover = card?.cover && card.cover?.mid ? getFullUrl(card.cover.mid) : null;

                    let borderColor;
                    switch (rank) {
                        case 'rank_a':
                            borderColor = 'linear-gradient(135deg, white, blue)';
                            break;
                        case 'rank_b':
                            borderColor = '#FF0000';
                            break;
                        case 'rank_c':
                            borderColor = '#AFEEEE';
                            break;
                        case 'rank_d':
                            borderColor = '#FFD700';
                            break;
                        case 'rank_e':
                            borderColor = '#4682B4';
                            break;
                        case 'rank_f':
                            borderColor = '#8B4513';
                            break;
                        default:
                            borderColor = 'linear-gradient(135deg, gray, darkgray)';
                            break;
                    }

                    if (rankCardsData[rank]) {
                        rankCardsData[rank].push({
                            thumbnail:
                                cover ||
                                'https://static.vecteezy.com/system/resources/previews/004/141/669/original/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg',
                            borderColor: borderColor,
                            id: card.id,
                        });
                    }
                });

                setRankCards(rankCardsData);
            } catch (e) {
                console.log(e);
                notify('Ошибка при выполнении запроса.', 'warning');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacterCards(id);
    }, [dataProvider, notify, id]);

    if (loading) {
        return <Loading />;
    }

    if (!rankCards) return null;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.23)',
                borderRadius: '8px',
                p: 2,
                gap: 1,
            }}
        >
            id: {previewedCard}
            {Object.entries(rankCards ?? {}).map(([rank, cards]) =>
                cards.length ? (
                    <div>
                        {rank.slice(-1).toUpperCase()} ({cards.length}):
                        <Grid container spacing={2}>
                            {cards.map((card, index) => (
                                <Grid
                                    item
                                    size={1.2}
                                    sx={{
                                        '&:hover': {
                                            opacity: '0.8',
                                        },
                                        cursor: 'pointer',
                                        opacity: previewedCard === card.id ? '0.4' : '1'
                                    }}
                                >
                                    <Card
                                        onClick={() => {
                                            setPreviewedCard(card.id);  
                                        }}
                                        key={`${rank}-${index}`}
                                        style={{
                                            border: `2px solid`,
                                            borderColor: card.borderColor,
                                            width: '100%',
                                        }}
                                    >
                                        <CardMedia component="img" alt="Character Card" image={card.thumbnail} />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                ) : null,
            )}
            <Drawer
                variant="persistent"
                open={previewedCard != null}
                anchor="right"
                onClose={() => setPreviewedCard(null)}
                sx={{ zIndex: 1000 }}
            >
                {previewedCard != null ? (
                    <ShowBase id={previewedCard} resource="cards">
                        <Stack flexDirection="column" gap={2} m={3} maxWidth="500px" width='400px'>
                            <Stack flexDirection="column" gap={2}>
                                <Stack flexDirection="row" justifyContent="end" sx={{ mt: 5 }}>
                                    <IconButton onClick={() => setPreviewedCard(null)} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                                <CardAvatar size={200} />

                                <Stack flexDirection="column" gap={2} sx={{ width: '100%' }}>
                                    {/*<TextField source='another_name' color='textSecondary' />*/}
                                    <Labeled>
                                        <CardRankField label="Ранг" />
                                    </Labeled>
                                    <Labeled>
                                        <TextField source="description" label="Описание" />
                                    </Labeled>
                                </Stack>
                            </Stack>
                            <Stack gap={2} flexDirection="column" alignItems="start" fullWidth>
                                <Labeled>
                                    <UserInfoField source="author" label="Автор" clickable />
                                </Labeled>
                                <Labeled>
                                    <TitleInfoField source="title" label="Тайтл" clickable />
                                </Labeled>
                            </Stack>
                        </Stack>
                    </ShowBase>
                ) : null}
            </Drawer>
        </Box>
    );
};

export default CharacterCardField;
