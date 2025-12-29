import type { z } from "zod";
import type { loboCustomerSchema } from "../lobo/schemas.lobo.js";
import { truncate } from "../truncate.text.js";
import type { bexioCreateContactSchema } from "./schemas.bexio.js";

export function buildBexioContactFromLoboCustomer(
  loboCustomer: z.infer<typeof loboCustomerSchema>
): Partial<z.infer<typeof bexioCreateContactSchema>> {
  return {
    contact_type_id: 1,
    name_1: truncate(loboCustomer.name, 79),
    name_2: truncate(loboCustomer.alias, 79),
    street_name: truncate(loboCustomer.street, 79),
    house_number: loboCustomer.housenumber?.toString() ?? null,
    address_addition: loboCustomer.suffix ?? null,
    postcode: loboCustomer.zip.length > 0 ? loboCustomer.zip : null,
    city: truncate(loboCustomer.city, 79),
    fax: loboCustomer.customernumber.toString(),
    phone_fixed: loboCustomer.jcard.tel ?
      truncate(loboCustomer.jcard.tel, 79) : null,
    mail: loboCustomer.jcard.email
      ? truncate(loboCustomer.jcard.email, 79)
      : null,
    owner_id: +(process.env["BEXIO_OWNER_ID"] ?? 1),
    user_id: +(process.env["BEXIO_USER_ID"] ?? 1),
  };
}
