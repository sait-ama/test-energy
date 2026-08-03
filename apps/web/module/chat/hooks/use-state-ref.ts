import { useRef } from 'react';

// warning:
// 2. ref.current = value; Ломаем стандарт реакта
export function useStateRef<T>(value: T) {
  const ref = useRef<T>(value);

  // ОСТОРОЖНО! TODO
  // useEffect(() => {
  ref.current = value;
  // });

  return ref;
}
