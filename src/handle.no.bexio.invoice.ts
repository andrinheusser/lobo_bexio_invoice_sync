import type { z } from "zod";
import { createBexioInvoiceForLoboInvoice } from "./bexio/create.bexio.invoice.for.lobo.invoice.js";
import type {
  loboCustomerSchema,
  loboInvoiceSchema,
} from "./lobo/schemas.lobo.js";
import syncBexioContact from "./sync.bexio.contact.js";

export async function handleNoBexioInvoice(
  customer: z.infer<typeof loboCustomerSchema>,
  loboInvoice: z.infer<typeof loboInvoiceSchema>
) {
  const bexioCustomer = await syncBexioContact(customer);
  // create Invoice
  if (loboInvoice.canceldate === "" && loboInvoice.invoice_total > 0) {
    return await createBexioInvoiceForLoboInvoice({
      customer: {
        lobo: customer,
        bexio: bexioCustomer,
      },
      loboInvoice,
    });
  }
  return;
}
