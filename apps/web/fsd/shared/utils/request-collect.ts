export const requestsCollector = <T>(callback: (values: T[]) => void) => {
  let values: T[] = [];
  let timeout: NodeJS.Timeout;

  return (value: T) => {
    values.push(value);

    const later = () => {
      callback(values);
      values = [];
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, 500);
  };
};
