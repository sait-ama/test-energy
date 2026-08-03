export const showPublishers = (list) => {
    if (!list || !Array.isArray(list)) return;

    return `${list
        ?.slice(0, 6)
        .map((item) => item.publisher.name)
        .join(', ')}`;
};
