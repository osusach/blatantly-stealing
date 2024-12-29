import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { Offer } from "../lib/db";

const BASE_URL = "https://www.tokyodev.com";

chromium.use(stealth());

export async function getTokyoDevEntryLevelJobs(): Promise<Offer[]> {
  const browser = await chromium.launch({ headless: false });
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
        const salary = salaryTag ? salaryTag + " JPY" : undefined;
        const title = offer.querySelector("h4")?.innerText;
        const doesntRequireExperience = [
          "intern",
          "internship",
          "new grad",
          "new graduate",
          "graduate",
          "no experience",
        ].some((word) => title?.toLowerCase().includes(word));
        const url = (offer.querySelector("h4 > a") as HTMLAnchorElement)?.href;
        return {
          id: url,
          company: company.querySelector("h3")?.innerText,
          title: offer.querySelector("h4")?.innerText,
          location: "JAPAN",
          published_at: new Date(),
          seniority: doesntRequireExperience ? "NOEXPERIENCE" : "JUNIOR",
          source: "TOKYODEV",
          salary: salary,
          url,
        } as Offer;
      });
    })
  );
  return offers.flat();
}
