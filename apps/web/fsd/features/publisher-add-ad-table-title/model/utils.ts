import dayjs from 'dayjs';

export const deserializeDateRange = (dates?: string | null) => {
  if (!dates)
    return {
      from: undefined,
      to: undefined,
    };

  const [from, to] = dates.split('_').map((it) => dayjs(String(it)));

  return {
    from: from?.isValid() ? from.toDate() : undefined,
    to: to?.isValid() ? to.toDate() : undefined,
  };
};

export const serializeDateRange = (dates?: { from?: Date; to?: Date }) => {
  if (!dates) return '_';

  const from = dates.from ? dates.from?.toISOString() : '';
  const to = dates.to ? dates.to?.toISOString() : '';

  return `${from}_${to}`;
};
