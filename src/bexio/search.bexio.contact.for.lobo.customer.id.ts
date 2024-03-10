import { z } from "zod";
import { fetchBexio } from "./connection.bexio.js";
import { bexioContactSchema } from "./schemas.bexio.js";

export async function searchBexioContactForLoboCustomerId(
  loboCustomerNumber: number
): Promise<z.infer<typeof bexioContactSchema> | undefined> {
  const contact = await fetchBexio(
    "/2.0/contact/search",
    {
      method: "POST",
      body: JSON.stringify([
        {
          field: "fax",
          value: "" + loboCustomerNumber,
          criteria: "equals",
        },
      ]),
    },
    {
      schema: z.array(bexioContactSchema),
    }
  );
  if (contact.length > 0) {
    return contact[0];
  }
  return undefined;
}
