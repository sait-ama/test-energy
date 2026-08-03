'use client';
const hasTimezone = (dateString: string) => {
  const timezoneRegex = /(Z|[+-]\d{2}:\d{2}|[+-]\d{2})$/;
  return timezoneRegex.test(dateString);
};

// TODO: remove this func in favor of next-intl implementation
export const getClientDate = ({ serverDateString }: { serverDateString: string }) => {
  if (!serverDateString) return;
  const formattedStringData =
    !hasTimezone(serverDateString) && !serverDateString.includes('+')
      ? `${serverDateString}+03:00`
      : serverDateString;
  return new Date(formattedStringData);
};
export const getServerDataWithTz = (date: string) => {
  if (hasTimezone(date)) return date;
  return `${date}+03:00`;
};
