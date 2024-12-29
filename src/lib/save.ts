import { createConnection, type Offer } from "./db";
import { err } from "neverthrow";

export async function saveOffers(offers: Offer[]) {
  const conn = createConnection();
  if (conn.isErr()) return err("can't stablish connection with database");

  const sql = `
      INSERT INTO offers (
        id,
        title,
        company,
        url,
        seniority,
        salary,
        location,
        published_at,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const result = await conn.value.batch(
    offers.map((offer) => ({
      sql,
      args: [
        offer.id,
        offer.title,
        offer.company,
        offer.url,
        offer.seniority,
        offer.salary || null,
        offer.location,
        offer.published_at,
        offer.source,
      ],
    })),
    "write"
  );

  console.log(result.length, "offers saved");
}
