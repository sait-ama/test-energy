function getPathWithoutDoubleSlash(str1, str2) {
    if (str1[str1.length - 1] === '/' && str2[0] === '/') return str1.slice(0, -1) + str2;
    return str1 + str2;
}

export const getFullUrl = (imgSrc) => {
    if (!imgSrc || typeof imgSrc !== 'string') return '';
    if (
        imgSrc.indexOf(import.meta.env.VITE_API_URL) !== -1 ||
        imgSrc.indexOf('https://') !== -1 ||
        imgSrc.indexOf('http://') !== -1
    )
        return imgSrc;

    const srcWithMedia =
        imgSrc.startsWith('/media') || imgSrc.startsWith('media')
            ? imgSrc
            : getPathWithoutDoubleSlash('/media/', imgSrc);

    return getPathWithoutDoubleSlash(import.meta.env.VITE_API_URL, srcWithMedia);
};
