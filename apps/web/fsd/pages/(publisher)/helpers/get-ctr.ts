interface getCtrI {
  clicks: number;
  views: number;
}

export const getCtr = ({ clicks, views }: getCtrI): number =>
  Math.round((clicks / views) * 100 * 10) / 10 || 0;
