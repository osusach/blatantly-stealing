import { z } from "zod";
import { getOffersFromTelegram, getOffersFromGetonboard } from "./lib";
import { identity, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { Client, createClient } from "@libsql/client";

const OfferSchema = z
  .object({
    id: z.string(),
    date: z.date(),
    content: z.string(),
    source: z.enum(["TELEGRAM_DCC", "GETONBOARD_CHILE"]),
  })
  .array();

function sendOffers(offers: z.infer<typeof OfferSchema>, client: Client) {
  return TE.tryCatch(async () => {
    const promises = offers.map(
      async (offer) =>
        await client.execute({
          sql: "INSERT INTO goodies values (?, ?, ?, ?)",
          args: [
            offer.id,
            offer.date.toDateString(),
            offer.content,
            offer.source,
          ],
        })
    );
    return await Promise.allSettled(promises);
  }, TE.left("Something failed in db statement"));
}

async function saveOffers(getOffers: () => Promise<any>, client: Client) {
  return await pipe(
    TE.tryCatch(getOffers, TE.left("Didn't recieve offers")),
    TE.flatMap((x) =>
      pipe(
        x,
        E.tryCatchK(OfferSchema.parse, (x) => E.left("Failed to parse")),
        TE.fromEither
      )
    ),
    TE.flatMap((x) => sendOffers(x, client)),
    TE.flatMap((x) =>
      pipe(
        x,
        E.fromPredicate(
          (x) => x.some((p) => p.status === "fulfilled"),
          () => E.left("No new offer was inserted")
        ),
        TE.fromEither
      )
    ),
    TE.matchW(
      (x) => ({ success: false, message: identity(x) }),
      (x) => ({ success: true, message: identity(x) })
    )
  )();
}

async function app() {
  console.log("hands up, this is a robbery");
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN,
  });
  await saveOffers(getOffersFromGetonboard, client);
  await saveOffers(getOffersFromTelegram, client);
  console.log("and we are done, now go find a job");
}

app();
