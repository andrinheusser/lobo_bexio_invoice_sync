const startSyncDate = process.env["START_SYNC_DATE"]
  ? new Date(process.env["START_SYNC_DATE"])
  : new Date();
const stopSyncDate = process.env["STOP_SYNC_DATE"]
  ? new Date(process.env["STOP_SYNC_DATE"])
  : null;
export function getDaterangeForInvoices(): [Date, Date][] {
  const ranges: [Date, Date][] = [];

  for (let i = 0; i < +(process.env["NUM_MONTHS_TO_SYNC"] ?? 12); i++) {
    let endDate = new Date(
      startSyncDate.getFullYear(),
      startSyncDate.getMonth() - i + 1,
      0
    );
    if (endDate > startSyncDate) endDate = startSyncDate;
    let startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    if (stopSyncDate && startDate < stopSyncDate) {
      if (endDate < stopSyncDate) continue;
      startDate = stopSyncDate;
    }
    ranges.push([startDate, endDate]);
  }
  return ranges;
}
