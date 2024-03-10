import type { z } from "zod";
import {
  createBexioContactForLoboCustomer,
  updateBexioContactForLoboCustomer,
} from "./bexio/create.bexio.contact.for.lobo.customer.js";
import type { bexioContactSchema } from "./bexio/schemas.bexio.js";
import { searchBexioContactForLoboCustomerId } from "./bexio/search.bexio.contact.for.lobo.customer.id.js";
import type { loboCustomerSchema } from "./lobo/schemas.lobo.js";
import { shouldUpdateBexioContact } from "./should.update.bexio.contact.js";

export default async function syncBexioContact(
  loboCustomer: z.infer<typeof loboCustomerSchema>
): Promise<z.infer<typeof bexioContactSchema>> {
  const bexioContact = await searchBexioContactForLoboCustomerId(
    loboCustomer.customernumber
  );
  if (!bexioContact) {
    return await createBexioContactForLoboCustomer(loboCustomer);
  }
  if (shouldUpdateBexioContact(loboCustomer, bexioContact)) {
    return await updateBexioContactForLoboCustomer(
      bexioContact.id,
      loboCustomer
    );
  }
  return bexioContact;
}
