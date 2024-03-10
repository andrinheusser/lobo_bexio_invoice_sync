import type { z } from "zod";
import { buildBexioContactFromLoboCustomer } from "./bexio/build.bexio.contact.from.lobo.customer.js";
import type { bexioContactSchema } from "./bexio/schemas.bexio.js";
import type { loboCustomerSchema } from "./lobo/schemas.lobo.js";

export function shouldUpdateBexioContact(
  loboCustomer: z.infer<typeof loboCustomerSchema>,
  bexioContact: z.infer<typeof bexioContactSchema>
): boolean {
  const newBexioContact = buildBexioContactFromLoboCustomer(loboCustomer);

  if (newBexioContact.name_1 !== bexioContact.name_1) return true;
  if (newBexioContact.name_2 !== bexioContact.name_2) return true;
  if (newBexioContact.address !== bexioContact.address) return true;
  if (newBexioContact.postcode !== bexioContact.postcode) return true;
  if (newBexioContact.city !== bexioContact.city) return true;
  if (newBexioContact.mail !== bexioContact.mail) return true;
  if (newBexioContact.phone_fixed !== bexioContact.phone_fixed) return true;

  return false;
}
