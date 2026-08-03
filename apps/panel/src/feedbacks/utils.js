export const statusToIconMap = {
    1: 'open',
    2: 'in_progress',
    3: 'accepted',
    4: 'rejected',
};
export const statusToText = {
    1: 'В ожидании',
    2: 'Обрабатывается',
    3: 'Обработано',
    4: 'Отклонено',
};

export const typesMapper = {
    'advice': 0,
    'positive_comment': 1,
    'negative_comment': 2,
    'sub_cancell_reason': 3
}
export const feedbackTypes = [
    {
        id: 'advice',
        name: 'Идея',
    },
    {
        id: 'positive_comment',
        name: 'Нравится',
    },
    {
        id: 'negative_comment',
        name: 'Не нравится',
    },
    {
        id: 'sub_cancell_reason',
        name: 'Отмена подписки',
    },
];
export const getType = (type) => {
    return feedbackTypes?.[typesMapper?.[type]]?.name??type??'-'
}
