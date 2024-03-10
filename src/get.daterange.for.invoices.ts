export function getDaterangeForInvoices(): [Date, Date][] {
  return Array.from(
    { length: +(process.env["NUM_MONTHS_TO_SYNC"] ?? 12) },
    (_, i) => {
      const startDate = new Date('2023-08-01');
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
  );
}
