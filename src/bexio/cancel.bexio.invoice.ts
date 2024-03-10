import { z } from "zod";
import { fetchBexio } from "./connection.bexio.js";

export async function cancelBexioInvoice(invoiceId: number) {
  return await fetchBexio(
    `/2.0/kb_invoice/${invoiceId}/cancel`,
    {
      method: "POST",
    },
    {
      schema: z.object({ success: z.boolean() }),
    }
  );
}
