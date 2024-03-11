export function getDaterangeForInvoices(): [Date, Date][] {
  return Array.from(
    { length: +(process.env["NUM_MONTHS_TO_SYNC"] ?? 12) },
    (_, i): [Date, Date] => {
      const startDate = new Date();
      let nextMonth =
        startDate.getMonth() - 1 < 0 ? 11 : startDate.getMonth() - i;
      startDate.setMonth(nextMonth);
      startDate.setDate(1);
      startDate.setHours(12);
      startDate.setMinutes(0);
      startDate.setSeconds(1);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      return [startDate, endDate];
    }
  ).filter(([start]) => {
    const stopSyncDate = process.env["STOP_SYNC_DATE"];
    if (!stopSyncDate) return true;
    return start.getTime() > new Date(stopSyncDate).getTime();
  });
}
