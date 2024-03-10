import PQueue from "p-queue";
import { type z } from "zod";

const queue = new PQueue({
  concurrency: 1,
  interval: 60000 / 499,
  intervalCap: 1,
});

export async function fetchBexio<S extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  { schema }: { schema: S }
): Promise<z.infer<S>> {
  return await queue.add(() => privatefetchBexio(path, init, { schema }));
}

async function privatefetchBexio<S extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  { schema }: { schema: S }
): Promise<z.infer<S>> {
  const token = process.env["BEXIO_TOKEN"];
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  const result = await fetch(`${process.env["BEXIO_HOST"]}${path}`, {
    ...init,
    headers,
  });

  if (!result.ok) {
    console.log(`Bexio fetch error: ${result.status} ${result.statusText}`);
    console.log(await result.text());
    throw new Error("Could not fetch bexio");
  }

  const json: unknown = await result.json();

  return schema.parse(json) as S;
}
