export function getDashboardDateRanges(now: Date = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
  return { startOfToday, fourteenDaysAgo };
}

export function lastNDayLabels(n: number, now: Date = new Date()): string[] {
  const labels: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    labels.push(d.toLocaleDateString("en-AU", { day: "numeric", month: "short" }));
  }
  return labels;
}
