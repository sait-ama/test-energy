const htmlEntitiesDict = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&copy;': '©',
    '&reg;': '®',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&deg;': '°',
    '&nbsp;': String.fromCharCode(160),
};

export function replaceHtmlEntities(str) {
    let plainText = '';
    let entity = null;
    let inTag = false;

    for (const char of str) {
        if (char === '<') inTag = true;
        if (char === '>') inTag = false;

        if (inTag) {
            plainText += char;
            continue;
        }

        if (char === '&' && !entity) {
            entity = '&';
            continue;
        }

        if (entity) {
            entity += char;
            if (char === ';') {
                plainText += htmlEntitiesDict[entity] ?? entity;
                entity = null;
            }
            continue;
        }

        plainText += char;
    }

    plainText += entity ?? '';

    return plainText;
}
