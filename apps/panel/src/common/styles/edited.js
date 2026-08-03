export const getLabelSx = (isNew) => {
    return {
        color: isNew ? '#3eb683' : 'text.primary',
        fontWeight: isNew ? 500 : 400,
    };
};
