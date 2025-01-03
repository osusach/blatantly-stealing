import { createConnection, type Offer } from "./db";
import { err } from "neverthrow";
import { doesTitleImplyNoExperience, formatCompanyName } from "./utils";

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

  let failed = 0;
  let success = 0;

  for (const offer of offers) {
    try {
      await conn.value.execute({
        sql,
        args: [
          offer.id,
          offer.title,
          formatCompanyName(offer.company),
          offer.url,
          doesTitleImplyNoExperience(offer.title)
            ? "NOEXPERIENCE"
            : offer.seniority,
          offer.salary || null,
          offer.location,
          offer.published_at,
          offer.source,
        ],
      });
      success = success + 1;
    } catch (error: any) {
      if (!(error?.code === "SQLITE_CONSTRAINT")) {
        console.log("======start======");
        console.error(
          [
            offer.id,
            offer.title,
            formatCompanyName(offer.company),
            offer.url,
            doesTitleImplyNoExperience(offer.title)
              ? "NOEXPERIENCE"
              : offer.seniority,
            offer.salary || null,
            offer.location,
            offer.published_at,
            offer.source,
          ],
          error?.code
        );
        console.log("======end======");
        failed = failed + 1;
      }
    }
  }

  console.log(`Offers saved: ${success}`);
  console.log(`Offers failed: ${failed}`);
}
