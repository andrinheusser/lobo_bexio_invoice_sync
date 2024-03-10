import type { z } from "zod";
import { fetchLobo } from "./connection.lobo.js";
import {
  getLoboApiResponseSchema,
  loboCustomerSchema,
} from "./schemas.lobo.js";

export async function getLoboCustomer(
  id: number
): Promise<z.infer<typeof loboCustomerSchema>> {
  const customer = await fetchLobo(
    `/customers/${id}?_embed=jcard`,
    {},
    { schema: getLoboApiResponseSchema(loboCustomerSchema) }
  );
  if (!customer.data.length || !customer.data[0])
    throw new Error(`No customer found for id ${id}`);
  return customer.data[0];
}
