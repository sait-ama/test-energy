/**
 * Хук для преобразования состояний загрузки и ошибок в формат,
 * совместимый с React Suspense.
 *
 * @param isLoading Флаг загрузки
 * @param error Объект ошибки, если есть
 * @param shouldSuspend Опциональный флаг, который определяет, нужно ли вызывать Suspense при загрузке
 */
export function useSuspenseState(isLoading: boolean, error: unknown, shouldSuspend = true) {
  if (error) {
    throw error;
  }

  if (isLoading && shouldSuspend) {
    throw new Promise((resolve) => {
      // Будем проверять состояние загрузки каждые 100мс
      const checkInterval = setInterval(() => {
        // Когда загрузка завершена, резолвим промис
        if (!isLoading) {
          clearInterval(checkInterval);
          resolve(null);
        }
      }, 100);
    });
  }
}
