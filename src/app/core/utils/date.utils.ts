export function getFirstDayOfMonth(date: Date = new Date()): Date {
  const firstDay = new Date(date);
  firstDay.setDate(1);
  firstDay.setHours(0, 0, 0, 0);
  return firstDay;
}

export function getLastDayOfMonth(date: Date = new Date()): Date {
  const lastDay = new Date(date);
  lastDay.setMonth(lastDay.getMonth() + 1);
  lastDay.setDate(0);
  lastDay.setHours(0, 0, 0, 0);
  return lastDay;
}
