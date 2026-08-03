export const defineRatingColor = (rating: string) => {
  const parsedRating = parseFloat(rating);

  if (parsedRating >= 8) {
    return '--r-success';
  }

  if (parsedRating >= 6) {
    return '--r-warning';
  }

  return '--r-destructive';
};
