import type { z } from "zod";
import { cancelBexioInvoice } from "./bexio/cancel.bexio.invoice.js";
import { getPaidAtDateForBexioInvoice } from "./bexio/get.payments.for.bexio.invoice.js";
import type { bexioInvoiceSchema } from "./bexio/schemas.bexio.js";
import { markLoboInvoiceAsPaid } from "./lobo/mark.lobo.invoice.paid.js";
import type { loboInvoiceSchema } from "./lobo/schemas.lobo.js";

export async function syncInvoices({
  loboInvoice,
  bexioInvoice,
}: {
  loboInvoice: z.infer<typeof loboInvoiceSchema>;
  bexioInvoice: z.infer<typeof bexioInvoiceSchema>;
}) {
  if (loboInvoice.canceldate !== "" && bexioInvoice.kb_item_status_id !== 19) {
    await cancelBexioInvoice(bexioInvoice.id);
  } else if (loboInvoice.canceldate === "") {
    const isPaidInBexio = bexioInvoice.kb_item_status_id === 9;
    const isPaidInLobo = loboInvoice.paymentdate !== "";

    if (isPaidInBexio && !isPaidInLobo) {
      const paymentDate = await getPaidAtDateForBexioInvoice(bexioInvoice.id);
      if (!paymentDate) return;
      await markLoboInvoiceAsPaid(
        loboInvoice.id,
        paymentDate,
        `Bexio: ${bexioInvoice.document_nr}`
      );
    }
  }
}
