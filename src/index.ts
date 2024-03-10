import functions from "@google-cloud/functions-framework";
import { searchBexioInvoiceForLoboInvoice } from "./bexio/search.bexio.invoice.for.lobo.invoice.js";
import { getDaterangeForInvoices } from "./get.daterange.for.invoices.js";
import { handleNoBexioInvoice } from "./handle.no.bexio.invoice.js";
import { getLoboCustomer } from "./lobo/get.lobo.customer.js";
import { getLoboInvoicesForDateranges } from "./lobo/get.lobo.invoices.for.daterange.js";
import { log, type MainLoopLogState } from "./logging.js";
import { syncInvoices } from "./sync.invoices.js";

functions.http("helloHttp", async (_req, res) => {
  const startTime = new Date(),
    invoiceDateranges: [start: Date, end: Date][] = getDaterangeForInvoices();

  let logState: MainLoopLogState = {
    currentMonthName: "",
    currentMonthProcessed: 0,
    monthStartTime: new Date(),
  };

  for await (const {
    invoice,
    monthName,
    totalForMonth,
  } of getLoboInvoicesForDateranges(invoiceDateranges)) {
    logState = log.atStartOfInvoiceProccessing(
      logState,
      monthName,
      totalForMonth
    );

    try {
      const bexioInvoice = await searchBexioInvoiceForLoboInvoice(invoice);
      if (!bexioInvoice) {
        const customer = await getLoboCustomer(invoice.fkcustomer);
        await handleNoBexioInvoice(customer, invoice);
      } else {
        await syncInvoices({
          loboInvoice: invoice,
          bexioInvoice,
        });
      }
    } catch (e) {
      console.log(`Error processing invoice ${invoice.numberformatted}`);
      console.log(e);
    }
  }

  log.atAllDone(startTime);

  res.send("ok");
});
