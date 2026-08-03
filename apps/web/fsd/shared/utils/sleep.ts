export const sleep = (ms: number) => new Promise((res) => setTimeout(() => res(1), ms));
