import PQueue from "p-queue";
import { z } from "zod";

const queue = new PQueue({
  concurrency: 1,
  interval: 60000 / 119,
  intervalCap: 1,
});

const tokenResponseSchema = z.object({
  token: z.string(),
});
let tokenStore: string | undefined = undefined;

async function login({
  user,
  pass,
  host,
}: {
  user: string;
  pass: string;
  host: string;
}) {
  const headers = new Headers();
  headers.set("Authorization", "Basic " + btoa(user + ":" + pass));
  headers.set("Content-Type", "application/json");
  const loginResponse = await fetch(`${host}/token`, {
    method: "POST",
    headers,
    body: JSON.stringify([
      "payment.read",
      "customer.read",
      "invoice.read",
      "invoice.edit",
      "embed.place:jcard",
    ]),
  });
  if (!loginResponse.ok) {
    console.log(
      `Lobo login error: ${loginResponse.status} ${loginResponse.statusText}`
    );
    console.log(await loginResponse.text());
    throw new Error("login failed");
  }
  const loginJson = tokenResponseSchema.parse(await loginResponse.json());
  return loginJson.token;
}

function isTokenExpired(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return true;
  const jwt = z
    .object({
      exp: z.number(),
    })
    .parse(JSON.parse(atob(payload)));
  return !jwt.exp || jwt.exp < Date.now() / 1000;
}

async function getToken({
  user,
  pass,
  host,
}: {
  user: string;
  pass: string;
  host: string;
}) {
  const dbToken = tokenStore;

  if (dbToken && isTokenExpired(dbToken)) {
    tokenStore = undefined;
  } else if (dbToken) {
    return dbToken;
  }

  const token = await login({ user, pass, host });

  tokenStore = token;
  return token;
}

async function privatefetchLobo<S extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  { schema }: { schema: S }
): Promise<z.infer<S>> {
  const token = await getToken({
    user: process.env["LOBO_API_USER"] ?? "",
    pass: process.env["LOBO_API_PASS"] ?? "",
    host: process.env["LOBO_API_HOST"] ?? "",
  });
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  const result = await fetch(`${process.env["LOBO_API_HOST"]}${path}`, {
    ...init,
    headers,
  });

  if (!result.ok) {
    console.log(`Lobo fetch error: ${result.status} ${result.statusText}`);
    console.log(await result.text());
    throw new Error("Could not fetch lobo");
  }

  const json: unknown = await result.json();

  return schema.parse(json) as S;
}

export async function fetchLobo<S extends z.ZodTypeAny>(
  path: string,
  init: RequestInit,
  { schema }: { schema: S }
): Promise<z.infer<S>> {
  return await queue.add(() => privatefetchLobo(path, init, { schema }));
}
