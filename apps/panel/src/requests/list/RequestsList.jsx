import * as React from 'react';
import {
    DateField,
    FilterButton,
    FilterForm,
    FilterList,
    FilterListItem,
    List,
    NumberInput,
    ReferenceField,
    SearchInput,
    TextInput,
    useListContext,
    useListSortContext,
    useRefresh,
} from 'react-admin';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SortIcon from '@mui/icons-material/Sort';
import { Box, Button, Menu, MenuItem, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import { RequestTypeField } from 'src/requests/list/RequestTypeField';
import UserInfoField from 'src/users/components/UserInfoField.jsx';
import { UserInfoWithDetailsPopover } from 'src/users/components/UserInfoWithDetailsPopover';
import { showPublishers } from 'src/utils/showPublishers.js';

import { CustomDatagrid } from '../../common/components/CustomDatagrid.jsx';
import { Empty } from '../../common/components/Empty';
import { IncludeExcludeFilter } from '../../common/components/ExcludableFilters.jsx';
import { Pagination } from '../../common/components/Paginations';
import { IconStatusField } from '../../common/fields/IconStatusField';
import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import { useCountRequests } from '../../hooks/useUncheckedRequests.js';
import TitleInfoField from '../../titles/common/TitleInfoField.jsx';
import { requestStatusToIcon } from '../edit/utils.js';

import rowSx from './rowSx';

const rankChoices = [
    { id: 'rank_s', name: 'S' },
    { id: 'rank_a', name: 'A' },
    { id: 'rank_b', name: 'B' },
    { id: 'rank_c', name: 'C' },
    { id: 'rank_d', name: 'D' },
    { id: 'rank_e', name: 'E' },
    { id: 'rank_f', name: 'F' },
    { id: 'rank_re', name: 'Re' },
];

const RankFilter = () => {
    const { filterValues, setFilters } = useListContext();
    const [mode, setMode] = React.useState('include');

    const includeRanks = Array.isArray(filterValues.rank) ? filterValues.rank : [];
    const excludeRanks = Array.isArray(filterValues.exclude_rank) ? filterValues.exclude_rank : [];
    const currentRanks = mode === 'include' ? includeRanks : excludeRanks;

    const handleRankToggle = (rankId) => {
        const source = mode === 'include' ? 'rank' : 'exclude_rank';
        const currentValues = filterValues[source] || [];

        let newValues;
        if (currentValues.includes(rankId)) {
            newValues = currentValues.filter((id) => id !== rankId);
        } else {
            newValues = [...currentValues, rankId];
        }

        if (newValues.length === 0) {
            const { [source]: _removed, ...rest } = filterValues;
            setFilters(rest, rest);
        } else {
            setFilters({ ...filterValues, [source]: newValues }, { ...filterValues, [source]: newValues });
        }
    };

    const handleClear = () => {
        const source = mode === 'include' ? 'rank' : 'exclude_rank';
        const { [source]: _removed, ...rest } = filterValues;
        setFilters(rest, rest);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                Ранг
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                    size="small"
                    variant={mode === 'include' ? 'contained' : 'outlined'}
                    onClick={() => setMode('include')}
                    sx={{ flex: 1, textTransform: 'none' }}
                >
                    Включить
                </Button>
                <Button
                    size="small"
                    variant={mode === 'exclude' ? 'contained' : 'outlined'}
                    onClick={() => setMode('exclude')}
                    sx={{ flex: 1, textTransform: 'none' }}
                >
                    Исключить
                </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {rankChoices.map((rank) => {
                    const isSelected = currentRanks.includes(rank.id);
                    return (
                        <Button
                            key={rank.id}
                            size="small"
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={() => handleRankToggle(rank.id)}
                            sx={{
                                minWidth: '40px',
                                fontWeight: 'bold',
                            }}
                        >
                            {rank.name}
                        </Button>
                    );
                })}
            </Box>

            {(includeRanks.length > 0 || excludeRanks.length > 0) && (
                <Box sx={{ mt: 1 }}>
                    {includeRanks.length > 0 && (
                        <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                            Включены: {includeRanks.join(', ')}
                        </Typography>
                    )}
                    {excludeRanks.length > 0 && (
                        <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                            Исключены: {excludeRanks.join(', ')}
                        </Typography>
                    )}
                    {currentRanks.length > 0 && (
                        <Button size="small" onClick={handleClear} sx={{ mt: 0.5, textTransform: 'none' }}>
                            Очистить {mode === 'include' ? 'включенные' : 'исключенные'}
                        </Button>
                    )}
                </Box>
            )}
        </Box>
    );
};

const requestsChoices = [
    {
        id: 'title_update',
        name: 'Изменение тайтла',
    },
    {
        id: 'title_add',
        name: 'Добавление тайтла',
    },
    {
        id: 'publisher_add',
        name: 'Добавление переводчиков',
    },
    {
        id: 'title_change_publisher',
        name: 'Передача тайтла',
    },
    {
        id: 'title_new_season',
        name: 'Новый сезон тайтла',
    },
    {
        id: 'title_chapter_update',
        name: 'Изменение главы тайтла',
    },
    {
        id: 'creator_add',
        name: 'Добавление автора',
    },
    {
        id: 'creator_update',
        name: 'Изменение автора',
    },
    {
        id: 'title_additional_add',
        name: 'Добавление ссылок на конкурентов',
    },
    {
        id: 'title_additional_update',
        name: 'Обновление ссылок на конкурентов',
    },
    {
        id: 'character_add',
        name: 'Добавление персонажа',
    },
    {
        id: 'character_update',
        name: 'Изменение персонажа',
    },
    {
        id: 'title_relation_add',
        name: 'Добавление связи тайтла',
    },
    {
        id: 'title_relation_update',
        name: 'Изменение связи тайтла',
    },
    {
        id: 'card_item_add',
        name: 'Добавление карточки',
    },
    {
        id: 'card_item_update',
        name: 'Изменение карточки',
    },
    {
        id: 'shop_image_item_add',
        name: 'Добавление предмета кастомизации',
    },
    {
        id: 'moment_add',
        name: 'Добавление момента',
    },
    {
        id: 'moment_update',
        name: 'Изменение момента',
    },
    {
        id: 'title_update_creators',
        name: 'Изменение создателей тайтла',
    },
    {
        id: 'title_add_creators',
        name: 'Добавление создателей тайтла',
    },
];

const filtersByRequestType = {
    title_update: [
        'search',
        'user_id',
        'title_id',
        'title__dir',
        'title__main_name',
        'title__secondary_name',
        'title__alt_name',
        'moderator_id',
    ],
    title_add: [
        'search',
        'user_id',
        'title__dir',
        'title__main_name',
        'title__secondary_name',
        'title__alt_name',
        'moderator_id',
    ],
    publisher_add: ['search', 'user_id', 'publisher_id', 'moderator_id'],
    title_change_publisher: [
        'search',
        'user_id',
        'title_id',
        'publisher_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
    title_new_season: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    title_chapter_update: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    creator_add: ['search', 'user_id', 'creator_id', 'moderator_id'],
    creator_update: ['search', 'user_id', 'creator_id', 'moderator_id'],
    title_additional_add: [
        'search',
        'user_id',
        'title_id',
        'title_additional_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
    title_additional_update: [
        'search',
        'user_id',
        'title_id',
        'title_additional_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
    character_add: ['search', 'user_id', 'character_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    character_update: [
        'search',
        'user_id',
        'character_id',
        'title_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
    title_relation_add: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    title_relation_update: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    card_item_add: ['search', 'user_id', 'card_item_id', 'moderator_id', 'rank', 'exclude_rank'],
    card_item_update: ['search', 'user_id', 'card_item_id', 'moderator_id', 'rank', 'exclude_rank'],
    shop_image_item_add: ['search', 'user_id', 'moderator_id'],
    moment_add: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    moment_update: ['search', 'user_id', 'title_id', 'title__dir', 'title__main_name', 'moderator_id'],
    title_update_creators: [
        'search',
        'user_id',
        'title_id',
        'creator_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
    title_add_creators: [
        'search',
        'user_id',
        'title_id',
        'creator_id',
        'title__dir',
        'title__main_name',
        'moderator_id',
    ],
};

const allFilters = {
    search: <SearchInput key="search" source="search" alwaysOn />,
    user_id: <NumberInput key="user_id" label="ID пользователя" source="user_id" />,
    title_id: <NumberInput key="title_id" label="ID тайтла" source="title_id" />,
    publisher_id: <NumberInput key="publisher_id" label="ID паблишера" source="publisher_id" />,
    title__dir: <TextInput key="title__dir" label="Dir тайтла" source="title__dir" />,
    title__main_name: <TextInput key="title__main_name" label="Основное название тайтла" source="title__main_name" />,
    title__secondary_name: (
        <TextInput key="title__secondary_name" label="Второстепенное название тайтла" source="title__secondary_name" />
    ),
    title__alt_name: (
        <TextInput key="title__alt_name" label="Альтернативное название тайтла" source="title__alt_name" />
    ),
    creator_id: <NumberInput key="creator_id" label="ID создателя" source="creator_id" />,
    moderator_id: <NumberInput key="moderator_id" label="ID модератора" source="moderator_id" />,
    title_additional_id: (
        <NumberInput key="title_additional_id" label="ID ссылок тайтла" source="title_additional_id" />
    ),
    card_item_id: <NumberInput key="card_item_id" label="ID карточки" source="card_item_id" />,
    character_id: <NumberInput key="character_id" label="ID персонажа" source="character_id" />,
    rank: <RankFilter key="rank" label="Ранг карты" />,
};

const DynamicFilters = () => {
    const { filterValues } = useListContext();

    const selectedTypes = React.useMemo(() => {
        const types = [];
        if (filterValues.type) types.push(...filterValues.type);
        if (filterValues.exclude_type) types.push(...filterValues.exclude_type);
        return types;
    }, [filterValues.type, filterValues.exclude_type]);

    const availableFilters = React.useMemo(() => {
        if (selectedTypes.length === 0) {
            return Object.keys(allFilters);
        }

        const filterSet = new Set();
        selectedTypes.forEach((type) => {
            const filters = filtersByRequestType[type] || [];
            filters.forEach((filter) => filterSet.add(filter));
        });

        return Array.from(filterSet);
    }, [selectedTypes]);

    const filters = React.useMemo(() => {
        return availableFilters.map((filterKey) => allFilters[filterKey]).filter(Boolean);
    }, [availableFilters]);

    const shouldShowRankFilter = React.useMemo(() => {
        if (selectedTypes.length === 0) return false;
        return selectedTypes.some((type) => {
            const filters = filtersByRequestType[type] || [];
            return filters.includes('rank') || filters.includes('exclude_rank');
        });
    }, [selectedTypes]);

    return (
        <Box>
            <Box display="flex" gap={1} alignItem="center" flexDirection="column">
                <FilterForm filters={filters} />
                {shouldShowRankFilter && <RankFilter />}
            </Box>
            <FilterButton filters={filters} />
        </Box>
    );
};

const requestStatuses = [
    {
        id: '1_open',
        name: 'Открыт',
    },
    {
        id: '2_accepted',
        name: 'Принят',
    },
    {
        id: '3_rejected',
        name: 'Отклонен',
    },
];

const SortButton = ({ fields }) => {
    const { sort, setSort } = useListSortContext();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedFields, setSelectedFields] = React.useState(() => {
        if (!sort?.field) return [{ field: 'created_at', order: 'DESC' }];

        const fields = sort.field.split(',');
        const orders = sort.order.split(',');
        return fields.map((field, index) => ({
            field,
            order: orders[index] || 'ASC',
        }));
    });

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeSort = (event) => {
        const field = event.currentTarget.dataset.sort;
        if (field) {
            const existingFieldIndex = selectedFields.findIndex((item) => item.field === field);
            let updatedFields;

            if (existingFieldIndex >= 0) {
                updatedFields = [...selectedFields];
                updatedFields[existingFieldIndex] = {
                    field,
                    order: updatedFields[existingFieldIndex].order === 'ASC' ? 'DESC' : 'ASC',
                };
            } else {
                updatedFields = [...selectedFields, { field, order: 'ASC' }];
            }

            setSelectedFields(updatedFields);

            const fieldsString = updatedFields.map((item) => item.field).join(',');
            const ordersString = updatedFields.map((item) => item.order).join(',');

            setSort({
                field: fieldsString,
                order: ordersString,
            });
        }
    };

    const handleRemoveField = (fieldToRemove) => {
        const updatedFields = selectedFields.filter((item) => item.field !== fieldToRemove);
        setSelectedFields(updatedFields);

        if (updatedFields.length > 0) {
            const fieldsString = updatedFields.map((item) => item.field).join(',');
            const ordersString = updatedFields.map((item) => item.order).join(',');

            setSort({
                field: fieldsString,
                order: ordersString,
            });
        }
    };

    const buttonLabel =
        selectedFields.length > 0
            ? `Сортировка: ${selectedFields
                  .map(
                      (item) =>
                          `${fields.find((f) => f.id === item.field)?.name} (${item.order === 'ASC' ? '↑' : '↓'})`,
                  )
                  .join(', ')}`
            : 'Нет';

    return (
        <>
            <Button
                aria-controls="sort-menu"
                aria-haspopup="true"
                color="primary"
                onClick={handleClick}
                startIcon={<SortIcon />}
                endIcon={<ArrowDropDownIcon />}
                size="small"
                variant="outlined"
                sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    mb: 1,
                }}
            >
                {buttonLabel}
            </Button>
            <Menu
                id="sort-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 400,
                        width: '320px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderBottom: '1px solid #eee',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        Сортировка
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Выберите поля для сортировки
                    </Typography>
                </Box>

                <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                        Выбранные поля:
                    </Typography>
                    {selectedFields.length > 0 ? (
                        <Box sx={{ mt: 1 }}>
                            {selectedFields.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 1,
                                        p: 1,
                                        borderRadius: '4px',
                                        bgcolor: 'rgba(0, 0, 0, 0.03)',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                                        },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                        {fields.find((f) => f.id === item.field)?.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mr: 1,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: '4px',
                                                bgcolor:
                                                    item.order === 'ASC'
                                                        ? 'rgba(76, 175, 80, 0.1)'
                                                        : 'rgba(244, 67, 54, 0.1)',
                                                color: item.order === 'ASC' ? 'success.main' : 'error.main',
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            {item.order === 'ASC' ? 'По возрастанию' : 'По убыванию'}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => handleRemoveField(item.field)}
                                            sx={{
                                                minWidth: 'auto',
                                                p: 0.5,
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    color: 'error.main',
                                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                },
                                            }}
                                        >
                                            ✕
                                        </Button>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Нет выбранных полей
                        </Typography>
                    )}
                </Box>

                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                        Доступные поля:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        {fields.map((field) => (
                            <MenuItem
                                onClick={handleChangeSort}
                                data-sort={field.id}
                                key={field.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    py: 1,
                                    px: 2,
                                    borderRadius: '4px',
                                    my: 0.5,
                                    backgroundColor: selectedFields.some((item) => item.field === field.id)
                                        ? 'rgba(25, 118, 210, 0.08)'
                                        : 'inherit',
                                    '&:hover': {
                                        backgroundColor: selectedFields.some((item) => item.field === field.id)
                                            ? 'rgba(25, 118, 210, 0.12)'
                                            : 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <Typography>{field.name}</Typography>
                                {selectedFields.some((item) => item.field === field.id) && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: '4px',
                                            bgcolor:
                                                selectedFields.find((item) => item.field === field.id)?.order === 'ASC'
                                                    ? 'rgba(76, 175, 80, 0.1)'
                                                    : 'rgba(244, 67, 54, 0.1)',
                                            color:
                                                selectedFields.find((item) => item.field === field.id)?.order === 'ASC'
                                                    ? 'success.main'
                                                    : 'error.main',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        {selectedFields.find((item) => item.field === field.id)?.order === 'ASC'
                                            ? 'ASC'
                                            : 'DESC'}
                                    </Typography>
                                )}
                            </MenuItem>
                        ))}
                    </Box>
                </Box>
            </Menu>
        </>
    );
};

const sortFields = [
    { id: 'created_at', name: 'Время' },
    { id: 'user_id', name: 'ID пользователя' },
    { id: 'title_id', name: 'ID тайтла' },
    // { id: 'publisher_id', name: 'ID паблишера' },
    // { id: 'creator_id', name: 'ID создателя' },
    // { id: 'moderator_id', name: 'ID модератора' },
    // { id: 'title_additional_id', name: 'ID ссылок тайтла' },
    // { id: 'card_item_id', name: 'ID карточки' },
    // { id: 'character_id', name: 'ID персонажа' },
];

const RequestList = (props) => {
    const refresh = useRefresh();
    useRecursiveTimeout(() => refresh(), 30000);
    const { data: counts } = useCountRequests();

    return (
        <List
            exporter={false}
            actions={<SortButton fields={sortFields} />}
            perPage={50}
            sort={{ field: 'created_at', order: 'DESC' }}
            {...props}
            aside={
                <Stack direction="column" alignItems="start" sx={{ px: 2, py: 1, width: '20%' }}>
                    <Box sx={{ mt: 2 }}>
                        <DynamicFilters />
                    </Box>
                    <Box>
                        <IncludeExcludeFilter
                            choices={requestsChoices}
                            label="Тип запроса"
                            name="type"
                            renderCount={(choice) => (
                                <Typography variant="caption" color="textSecondary">
                                    {counts[`${choice.id}_count`]}
                                </Typography>
                            )}
                        />
                    </Box>
                    <Box>
                        <FilterList label="Статус запроса">
                            {requestStatuses.map((request) => (
                                <FilterListItem key={request.id} label={request.name} value={{ status: request.id }} />
                            ))}
                        </FilterList>
                    </Box>
                </Stack>
            }
            pagination={<Pagination />}
            sx={{ width: '100%', mt: 1 }}
        >
            <CustomDatagrid
                optimized
                rowClick="show"
                rowSx={rowSx}
                bulkActionButtons={false}
                {...props}
                empty={<Empty />}
            >
                <DateField
                    source="created_at"
                    label="Время"
                    showTime
                    sortable={true}
                    options={{
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                    locales="ru-RU"
                />
                <RequestTypeField sortable={false} label="Заявка" />

                <UserInfoWithDetailsPopover
                    source="user"
                    label="Предложил"
                    sortable={true}
                    clickable
                    renderSecondaryField={(record) => (
                        <Typography sx={{ fontSize: 10, maxWidth: 150 }} color="text.secondary">
                            {showPublishers(record.publishers)}
                        </Typography>
                    )}
                />
                <ReferenceField reference="titles" source="title" target="id">
                    <TitleInfoField clickable />
                </ReferenceField>
                <UserInfoField source="moderator" label="Модератор" sortable={true} clickable />
                <IconStatusField label="Статус" map={requestStatusToIcon} />
            </CustomDatagrid>
        </List>
    );
};

export default RequestList;
