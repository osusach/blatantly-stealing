import { chromium } from "playwright";
import { Offer } from "../lib/db";

const BASE_URL = "https://www.tokyodev.com";

export async function getTokyodevEntryLevelJobs(): Promise<Offer[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });

  await page.goto(
    BASE_URL +
      "/jobs?language_requirement[]=none&applicant_location[]=apply_from_abroad&seniority[]=intern&seniority[]=junior"
  );
  const offers = await page.$$eval("ul li", (companies) =>
    companies.map((company) => {
      const offers = company.querySelectorAll(
        '[data-collapsable-list-target="item"]'
      );
      return Array.from(offers).map((offer) => {
        const salaryTag = (
          offer.querySelector('a[href="/jobs/salary-data"]') as HTMLElement
        )?.innerText;
        return {
          company: company.querySelector("h3")!.innerText,
          title: offer.querySelector("h4")!.innerText,
          salary: salaryTag ? salaryTag + " JPY" : undefined,
          url: (offer.querySelector("h4 > a") as HTMLAnchorElement)?.href,
        };
      });
    })
  );
  // to avoid dups, HENNGE offers are handled by japandev
  const formated = offers
    .flat()
    .filter((offer) => offer.company !== "HENNGE")
    .map(
      (offer) =>
        ({
          id: offer.url,
          title: offer.title,
          company: offer.company,
          url: offer.url,
          seniority: "JUNIOR",
          location: "JAPAN",
          published_at: new Date(),
          source: "TOKYODEV",
          salary: offer.salary,
        } as Offer)
    );
  return formated;
}
