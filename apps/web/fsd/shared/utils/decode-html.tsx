const entities = {
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

const entityPattern = /&([a-z]+);/gi;

export const decodeHtml = (text: string) =>
  text.replace(entityPattern, (match, entity) => {
    entity = `&${entity.toLowerCase()};`;
    if (entities.hasOwnProperty(entity)) {
      return entities[entity];
    }

    return match;
  });
