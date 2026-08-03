export function daysToDateString(days: number): string {
  const currentDate = new Date();
  const targetDate = new Date(currentDate);
  targetDate.setDate(currentDate.getDate() - days);

  return targetDate.toISOString().split('T')[0]!;
}
