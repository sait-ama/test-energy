export const removeEmptyParagrapgh = (htmlString: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  const elements = tempDiv.querySelectorAll('p, div, span') || [];
  if (!elements) return htmlString;
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i]!;
    const trimInner = element.innerHTML.trim();
    if (trimInner === '' || trimInner === '<br>') {
      element.remove();
    } else if (element.tagName === 'P') {
      element.remove();
    }
    if (i === 0) continue;
    if (element.tagName === 'P' && trimInner === '<br>') {
      const prevElement = elements[i - 1]!;
      const prevTrim = prevElement.innerHTML.trim();
      if (prevElement.tagName === 'P' && prevTrim === '<br>') {
        prevElement.remove();
      }
    }
  }

  return tempDiv.innerHTML;
};
