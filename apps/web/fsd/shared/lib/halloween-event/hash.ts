import { sha256 } from './sha256-isomorphic';

// сгенеренный от той же утилки ключ sha256('ebanarot')
const staticToken = '7472fc4d1888c4c3c2fde8018b52d39fef304183512e6b1d7f94530f57e31cf4';

// Вставляем текущие очки ивента посередине
//
const generateDynamicToken = (eventPoints: number) => {
  const eventPointsString = String(eventPoints);

  const staticTokenStart = staticToken.slice(0, 16);
  const staticTokenEnd = staticToken.slice(17 + eventPointsString.length, staticToken.length);

  return `${staticTokenStart}${eventPoints}${staticTokenEnd}`;
};

export const generateHash = async (eventPoints: number) => {
  const dynamicToken = generateDynamicToken(eventPoints);
  const hash = await sha256(dynamicToken);

  // если браузер не поддерживает crypto API, возвращаем динамический токен вместо хэша
  // нода поддерживает
  return hash ?? dynamicToken;
};

// проверка будет только на сервере
export const verifyHash = async (eventPoints: number, hash: string) => {
  const dynamicToken = generateDynamicToken(eventPoints);
  const generatedHash = await sha256(dynamicToken);

  return hash === generatedHash || hash === dynamicToken;
};
