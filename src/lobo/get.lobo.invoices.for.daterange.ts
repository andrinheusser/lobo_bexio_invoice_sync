import type { z } from "zod";
import { fetchLobo } from "./connection.lobo.js";
import { getLoboApiResponseSchema, loboInvoiceSchema } from "./schemas.lobo.js";

const onlySyncIfPaidAtAfter = process.env["ONLY_SYNC_IF_PAID_AT_AFTER"]
  ? new Date(process.env["ONLY_SYNC_IF_PAID_AT_AFTER"])
//  : null;
  : "1970-01-01T00:00:00.000Z";

export async function* getLoboInvoicesForDateranges(
  dateranges: [start: Date, end: Date][]
): AsyncGenerator<{
  invoice: z.infer<typeof loboInvoiceSchema>;
  monthName: string;
  totalForMonth: number;
}> {
  for (const [startDate, endDate] of dateranges) {
    const search = new URLSearchParams({
      "invoicedate[gte]": startDate.toISOString().slice(0, 10),
      "invoicedate[lte]": endDate.toISOString().slice(0, 10),
    });

    const monthName = startDate.toLocaleDateString("de-CH", {
      month: "long",
      year: "numeric",
    });
    
    const invoices = await fetchLobo(
      `/invoices?${search.toString()}`,
      {},
      { schema: getLoboApiResponseSchema(loboInvoiceSchema) }
    ).catch(() => {
      console.log(`Error fetching invoices for ${monthName}`);
      return { data: [] };
    });
    
    console.log(invoices);
    


    for (const invoice of invoices.data) {
      if (
        onlySyncIfPaidAtAfter &&
        invoice.paymentdate &&
        invoice.paymentdate.length > 0 &&
        new Date(invoice.paymentdate) < onlySyncIfPaidAtAfter
      ) {
        continue;
      }
      yield {
        invoice,
        monthName,
        totalForMonth: invoices.data.length,
      };
    }
  }
}
