import { z } from "zod";
import type { loboCustomerSchema } from "../lobo/schemas.lobo.js";
import { buildBexioContactFromLoboCustomer } from "./build.bexio.contact.from.lobo.customer.js";
import { fetchBexio } from "./connection.bexio.js";
import { bexioContactSchema } from "./schemas.bexio.js";

export async function createBexioContactForLoboCustomer(
  loboCustomer: z.infer<typeof loboCustomerSchema>
) {
  return await fetchBexio(
    "/2.0/contact",
    {
      method: "POST",
      body: JSON.stringify(buildBexioContactFromLoboCustomer(loboCustomer)),
    },
    { schema: bexioContactSchema }
  );
}

export async function updateBexioContactForLoboCustomer(
  bexioContactId: number,
  loboCustomer: z.infer<typeof loboCustomerSchema>
) {
  return await fetchBexio(
    `/2.0/contact/${bexioContactId}`,
    {
      method: "POST",
      body: JSON.stringify(buildBexioContactFromLoboCustomer(loboCustomer)),
    },
    { schema: bexioContactSchema }
  );
}
