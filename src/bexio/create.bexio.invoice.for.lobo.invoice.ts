import { z } from "zod";
import type {
  loboCustomerSchema,
  loboInvoiceSchema,
} from "../lobo/schemas.lobo.js";
import { truncate } from "../truncate.text.js";
import { fetchBexio } from "./connection.bexio.js";
import {
  bexioInvoiceSchema,
  type bexioContactSchema,
  type bexioCreateInvoiceSchema,
} from "./schemas.bexio.js";

export async function createBexioInvoiceForLoboInvoice({
  customer,
  loboInvoice,
}: {
  customer: {
    lobo: z.infer<typeof loboCustomerSchema>;
    bexio: z.infer<typeof bexioContactSchema>;
  };
  loboInvoice: z.infer<typeof loboInvoiceSchema>;
}): Promise<z.infer<typeof bexioInvoiceSchema>> {
  const invoiceMonth = new Date(loboInvoice.invoicedate).toLocaleDateString(
    "de-CH",
    { month: "short", year: "2-digit" }
  );
  const title = truncate(`${invoiceMonth} ${customer.lobo.name}`, 79);

  const days_valid = +(loboInvoice.paymentterm.split(" ")[0] ?? 30);
  let validToDate = new Date(loboInvoice.created);
  validToDate.setDate(validToDate.getDate() + days_valid);

  const revPosition: z.infer<typeof bexioCreateInvoiceSchema>["positions"][0] =
    {
      account_id: +(process.env["BEXIO_INVOICE_REVENUE_ACCOUNT_ID"] ?? 101),
      amount: "1",
      text: "Dienstleistungen",
      discount_in_percent: "0.0000",
      tax_id: +(process.env["BEXIO_INVOICE_REVENUE_TAX_ID"] ?? 1),
      unit_id: +(process.env["BEXIO_INVOICE_UNIT_ID"] ?? 1),
      unit_price: (loboInvoice.invoice_total - loboInvoice.expenditures_total)
        .toFixed(2)
        .toString(),
      type: "KbPositionCustom",
    };

  const expPosition: z.infer<typeof bexioCreateInvoiceSchema>["positions"][0] =
    {
      account_id: +(process.env["BEXIO_INVOICE_EXPENSES_ACCOUNT_ID"] ?? 101),
      amount: "1",
      text: "Barauslagen",
      discount_in_percent: "0.0000",
      tax_id: +(process.env["BEXIO_INVOICE_EXPENSES_TAX_ID"] ?? 1),
      unit_id: +(process.env["BEXIO_INVOICE_UNIT_ID"] ?? 1),
      unit_price: loboInvoice.expenditures_total.toFixed(2).toString(),
      type: "KbPositionCustom",
    };
  const positions: z.infer<typeof bexioCreateInvoiceSchema>["positions"] = [
    revPosition,
  ];
  if (loboInvoice.expenditures_total > 0) {
    positions.push(expPosition);
  }

  const bexioInvoice: z.infer<typeof bexioCreateInvoiceSchema> = {
    title,
    contact_id: customer.bexio.id,
    user_id: +(process.env["BEXIO_INVOICE_USER_ID"] ?? 1),
    pr_project_id: null,
    language_id: +(process.env["BEXIO_INVOICE_LANGUAGE_ID"] ?? 1),
    bank_account_id: +(process.env["BEXIO_INVOICE_BANKING_ACCOUNT_ID"] ?? 1),
    currency_id: +(process.env["BEXIO_INVOICE_CURRENCY_ID"] ?? 1),
    payment_type_id: !loboInvoice.iscashinvoice
      ? +(process.env["BEXIO_INVOICE_PAYMENT_TYPE_INVOICE_ID"] ?? 4)
      : +(process.env["BEXIO_INVOICE_PAYMENT_TYPE_CASH_ID"] ?? 2),
    header: "",
    footer: "",
    mwst_type: 0,
    mwst_is_net: false,
    show_position_taxes: true,
    is_valid_from: loboInvoice.invoicedate.slice(0, 10),
    is_valid_to: validToDate.toISOString().slice(0, 10),
    api_reference: "lobo-" + loboInvoice.id.toString(),
    reference: loboInvoice.numberformatted,
    positions,
  };
  const invoice = await fetchBexio(
    "/2.0/kb_invoice",
    {
      method: "POST",
      body: JSON.stringify(bexioInvoice),
    },
    {
      schema: bexioInvoiceSchema,
    }
  );
  await issueBexioInvoice(invoice.id);
  return invoice;
}

export async function issueBexioInvoice(id: number) {
  return await fetchBexio(
    `/2.0/kb_invoice/${id}/issue`,
    { method: "POST" },
    {
      schema: z.object({ success: z.boolean() }),
    }
  );
}
