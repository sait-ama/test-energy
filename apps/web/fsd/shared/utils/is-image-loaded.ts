export const preloadImage = (src?: string | null): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    if (!src) return reject();

    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
