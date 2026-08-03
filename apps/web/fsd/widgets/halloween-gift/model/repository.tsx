export namespace HalloweenEventRepository {
  // export const collectGift = (signature: string) => api.post('/bff-api/event/halloween', signature);
  export const collectGift = (signature: string) =>
    fetch('/bff-api/event/halloween', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: signature,
    });
}
