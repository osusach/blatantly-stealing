import { chromium } from "playwright";
import { Offer } from "@lib/db";

const BASE_URL = "https://japan-dev.com";

export async function getJapandevEntryLevelJobs(): Promise<Offer[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });
  await page.goto(BASE_URL + "/jobs");

  // apply filters
  await page.waitForTimeout(500);
  await page.waitForSelector("#candidate_location-candidate_location_anywhere");
  await page.click("#candidate_location-candidate_location_anywhere");

  await page.waitForTimeout(500);
  await page.waitForSelector(
    "#japanese_level_enum-japanese_level_not_required"
  );
  await page.click("#japanese_level_enum-japanese_level_not_required");

  await page.waitForTimeout(500);
  await page.waitForSelector("#seniority_level-seniority_level_junior");
  await page.click("#seniority_level-seniority_level_junior");

  await page.waitForTimeout(500);
  await page.waitForSelector("#seniority_level-seniority_level_new_grad");
  await page.click("#seniority_level-seniority_level_new_grad");

  await page.waitForTimeout(2_000);

  const offers = await page.$$eval(
    "ul.job-list__jobs div.job-item__inner",
    (blocks) =>
      blocks.map((block) => {
        const title = block.querySelector("a.job-item__title")!.textContent!;
        const company = block.querySelector(
          "div.job-item__contract-type"
        )!.textContent;

        // not sure if that data attribute if always present for salaries
        const salaryTag =
          Array.from(
            block.querySelectorAll(
              "div[data-v-a1f975e9] > span[data-v-a1f975e9]"
            )
          )
            .map((tag) => tag.textContent?.replace(/\s+/g, " ").trim())
            .find((text) => text?.includes("¥")) || null;

        const url = (
          block.querySelector("a.job-item__title") as HTMLAnchorElement
        ).href;
        return {
          title,
          company,
          salary: salaryTag ? salaryTag.trim() + " JPY" : undefined,
          url,
        };
      })
  );

  const formatOffers = offers.map(
    (offer) =>
      ({
        id: offer.url,
        title: offer.title,
        published_at: new Date(),
        source: "JAPANDEV",
        company: offer.company,
        seniority: "JUNIOR",
        location: "JAPAN",
        salary: offer.salary,
        url: offer.url,
      } as Offer)
  );
  return formatOffers;
}
