/**
 * Checks if the input is a valid date string or Date object
 * @param date - The date string or Date object to check
 * @returns boolean indicating if the input is a valid date
 */
export const isDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;

  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }

  // Try parsing the string as a date
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};
