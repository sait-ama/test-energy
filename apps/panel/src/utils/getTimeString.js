const dateOptions = {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
};

export const getTimeString = (date) => {
    return date ? new Date(date).toLocaleDateString('ru-Ru', dateOptions) : null;
};
