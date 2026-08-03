export const decodeHTMLEntities = (html) => {
    try {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = html;
        return textArea.value;
    } catch {
        return '';
    }
};
