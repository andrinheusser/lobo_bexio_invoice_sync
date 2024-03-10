import { z } from "zod";
import type { loboInvoiceSchema } from "../lobo/schemas.lobo.js";
import { fetchBexio } from "./connection.bexio.js";
import { bexioInvoiceSchema } from "./schemas.bexio.js";

export async function searchBexioInvoiceForLoboInvoice(
  loboInvoice: z.infer<typeof loboInvoiceSchema>
): Promise<z.infer<typeof bexioInvoiceSchema> | undefined> {
  const invoice = await fetchBexio(
    "/2.0/kb_invoice/search",
    {
      method: "POST",
      body: JSON.stringify([
        {
          field: "api_reference",
          value: "lobo-" + loboInvoice.id.toString(),
          criteria: "equals",
        },
      ]),
    },
    {
      schema: z.array(bexioInvoiceSchema),
    }
  );
  if (invoice.length > 0) {
    return invoice[0];
  }
  return undefined;
}
