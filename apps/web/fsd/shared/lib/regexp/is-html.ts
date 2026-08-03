export const htmlRegExp = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/gi;

export const isHtml = (str: string) => htmlRegExp.test(str);
