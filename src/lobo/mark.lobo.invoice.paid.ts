import { fetchLobo } from "./connection.lobo.js";
import { getLoboApiResponseSchema, loboInvoiceSchema } from "./schemas.lobo.js";

export async function markLoboInvoiceAsPaid(
  invoiceId: number,
  paymentDate: Date,
  noteprivate: string
): Promise<void> {
  await fetchLobo(
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
  ).catch((e) => {
    console.log(`Error marking invoice invoices/${invoiceId} as paid`);
  });
}
