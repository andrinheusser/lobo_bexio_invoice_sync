import type { z } from "zod";
import { fetchLobo } from "./connection.lobo.js";
import { getLoboApiResponseSchema, loboInvoiceSchema } from "./schemas.lobo.js";

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
      "invoicedate[lt]": endDate.toISOString().slice(0, 10),
    });

    const monthName = startDate.toLocaleDateString("de-CH", {
      month: "long",
      year: "numeric",
    });

    const invoices = await fetchLobo(
      `/invoices?${search.toString()}`,
      {},
      { schema: getLoboApiResponseSchema(loboInvoiceSchema) }
    );
    for (const invoice of invoices.data) {
      yield {
        invoice,
        monthName,
        totalForMonth: invoices.data.length,
      };
    }
  }
}
