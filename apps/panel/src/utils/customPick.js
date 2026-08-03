export const customPick = (object, path) => {
    if (!object) return null;

    return path.split('.').reduce((acc, key) => {
        acc = acc[key];

        return acc;
    }, object);
};
