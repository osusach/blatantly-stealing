import { chromium, Page } from "playwright";
import { Offer } from "../lib/db";
import { shorten } from "../lib/shorten";

const BASE_URL = "https://dev-korea.com";

// NOTE
// all selectors are unstable, if the site changes, this breaks
export async function getDevKoreaEntryLevelOffers(): Promise<Offer[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    BASE_URL + "/jobs?employment_types=internship&korean_levels=not-required"
  );
  await page
    .locator("div")
    .filter({ hasText: "Employment TypesFull-timePart" })
    .nth(3)
    .click();
  const links = await page.$$eval("ul li a.text-black", (elements) =>
    elements.map((el) => el.getAttribute("href") || "").filter(Boolean)
  );

  const offers: (Offer | undefined)[] = await Promise.all(
    links.map(async (link) => {
      const newPage: Page = await context.newPage();
      const url = BASE_URL + link;
      await newPage.goto(url);
      const [company, title, content] = await Promise.all([
        newPage.textContent(
          "div > main > div > div > nav > ol > li:nth-child(3) > a"
        ),
        newPage.textContent(
          "#__next > div > main > div > div > nav > ol > li:nth-child(4) > span"
        ),
        newPage.textContent("div.kYifnh"),
      ]);
      const published_at = new Date();
      await newPage.close();
      return company == undefined || title == undefined || content == undefined
        ? undefined
        : ({
            id: url,
            company,
            title,
            seniority: "NOEXPERIENCE",
            url,
            published_at,
            location: "KOREA",
            source: "DEVKOREA",
          } as Offer);
    })
  );
  return offers.filter((offer) => offer !== undefined);
}
