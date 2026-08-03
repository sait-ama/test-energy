export const transformHeroCardRank = (rank?: string | undefined | null) => {
  if (!rank?.endsWith('_rank')) return 'X';

  return rank.slice(5).toUpperCase();
};
