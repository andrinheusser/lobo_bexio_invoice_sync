import { z } from "zod";

const JCardSubSchema = z.tuple([
  z.string(),
  z.object({}),
  z.string(),
  z.string(),
]);

const JCardSchema = z
  .array(z.tuple([z.string(), z.array(JCardSubSchema)]))
  .transform((val) => {
    if (val.length === 0) return null;
    return val[0] ? val[0][1] : null;
  })
  .transform((val) => {
    if (val === null) {
      return {
        tel: null,
        email: null,
      };
    }
    const tel = val.find(([key]) => key === "tel");
    const email = val.find(([key]) => key === "email");
    return {
      tel: tel ? tel[3] : null,
      email: email ? email[3] : null,
    };
  });
// lobo customer schema json:
/*
{
    "id": 1,
    "customernumber": 20001,
    "name": "Veloblitz - Verein für Fahrradboten und intelligente Logistik",
    "alias": "Veloblitz",
    "fkplace": 3,
    "placetype": "place",
    "street": "Nibelungengasse",
    "housenumber": 32,
    "addition": "",
    "suffix": "",
    "hnr_add_sfx": "32",
    "zip": "8010",
    "city": "Graz",
    "isocode": "AUT"
  },
  */

export const loboCustomerSchema = z.object({
  id: z.number(),
  customernumber: z.number(),
  name: z.string(),
  alias: z.string(),
  fkplace: z.number(),
  placetype: z.string(),
  street: z.string(),
  housenumber: z.number().optional(),
  addition: z.string(),
  suffix: z.string(),
  hnr_add_sfx: z.string(),
  zip: z.string(),
  city: z.string(),
  isocode: z.string(),
  jcard: JCardSchema,
});

export const loboInvoiceSchema = z.object({
  id: z.number(),
  created: z.string(),
  invoicedate: z.string(),
  canceldate: z.string(),
  paymentdate: z.string(),
  fkcustomer: z.number(),
  fkcarrier: z.number().nullable(),
  status: z.string(),
  numberformatted: z.string(),
  handlingfee: z.object({
    net: z.number(),
    vat: z.number(),
    gross: z.number(),
  }),
  invoice: z.object({
    net: z.number(),
    vat: z.number(),
    gross: z.number(),
  }),
  expenditures_total: z.number(),
  invoice_total: z.number(),
  paymentterm: z.string(),
  discountterm: z.string(),
  discountterm_percentage: z.number(),
  isdebitorder: z.boolean(),
  isreversecharge: z.boolean(),
  iscashinvoice: z.boolean(),
  issimpleformat: z.boolean(),
  isoverdue: z.boolean(),
  noteprivate: z.string(),
  customerreference: z.string(),
  customercomment: z.string(),
  external_api_id: z.number().nullable(),
  external_api_uuid: z.string(),
  external_api_data: z.string(),
});

export const getLoboApiResponseSchema = <S extends z.AnyZodObject>(
  objectSchema: S
) => {
  return z.object({
    data: z.array(objectSchema),
    meta: z.object({
      count: z.number(),
      totalcount: z.number(),
    }),
  });
};
