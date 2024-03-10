import { z } from "zod";
import { fetchBexio } from "./connection.bexio.js";

export async function getPaymentsForBexioInvoice(invoiceId: number) {
  return await fetchBexio(
    `/2.0/kb_invoice/${invoiceId}/payment`,
    {
      method: "GET",
    },
    {
      schema: z.array(
        z.object({
          id: z.number(),
          date: z.string(),
        })
      ),
    }
  );
}

export async function getPaidAtDateForBexioInvoice(invoiceId: number) {
  const payments = await getPaymentsForBexioInvoice(invoiceId);
  if (!payments.length) return null;

  if (payments.length === 1 && payments[0]) {
    return new Date(payments[0].date);
  }

  let paidAt: Date | null = null;
  for (let i = 0; i < payments.length; i++) {
    const current = payments[i];
    if (!current) continue;
    if (paidAt === null) {
      paidAt = new Date(current.date);
    } else if (
      paidAt &&
      paidAt.getTime() < new Date(current.date).getTime()
    ) {
      paidAt = new Date(current.date);
    }
  }
  return paidAt;
}
