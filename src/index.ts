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
  return TE.tryCatch(
    async () =>
      await Promise.allSettled(
        offers.map(
          async (offer) =>
            await client.execute({
              sql: "INSERT INTO offers (id, date, content, source)",
              args: [offer.id, offer.date, offer.content, offer.source],
            })
        )
      ),
    TE.left("Something failed in db statement")
  );
}

const validateOffersSchema = E.tryCatchK(OfferSchema.parse, E.toError);

async function saveOffers(getOffers: () => Promise<any>, client: Client) {
  return await pipe(
    TE.tryCatch(getOffers, TE.left("Didn't recieve offers")),
    TE.flatMap((x) =>
      pipe(
        x,
        E.tryCatchK(OfferSchema.parse, () => E.left("Failed to parse")),
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
  // TODO agregar los datos a esta cosa
  const client = createClient({
    url: "libsql://your-database.turso.io",
    authToken: "your-auth-token",
  });

  console.log(await saveOffers(getOffersFromGetonboard, client));
  console.log(await saveOffers(getOffersFromTelegram, client));
}

app();
