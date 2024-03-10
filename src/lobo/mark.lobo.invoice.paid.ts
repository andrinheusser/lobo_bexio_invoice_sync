import { fetchLobo } from "./connection.lobo.js";
import { getLoboApiResponseSchema, loboInvoiceSchema } from "./schemas.lobo.js";

export async function markLoboInvoiceAsPaid(
  invoiceId: number,
  paymentDate: Date,
  noteprivate: string
) {
  return await fetchLobo(
    `/invoices/${invoiceId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        paymentdate: paymentDate.toISOString().slice(0, 10) + "T12:00:00+00:00",
        noteprivate,
      }),
    },
    {
      schema: getLoboApiResponseSchema(loboInvoiceSchema),
    }
  );
}
