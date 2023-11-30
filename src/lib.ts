import { pipe } from "fp-ts/lib/function";
import { chromium } from "playwright";

export async function getOffersFromTelegram() {
  const browser = await chromium.launch();

  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto("https://t.me/s/DCCEmpleo");

  const offers = await page.evaluate(() => {
    const year = new Date().getFullYear();
    const posts = Object.values(
      document.querySelectorAll(
        ".tgme_widget_message_wrap.js-widget_message_wrap"
      )
    );
    return posts.map((post) => ({
      id: post
        .querySelector(
          ".tgme_widget_message.text_not_supported_wrap.js-widget_message"
        )!
        .getAttribute("data-post"),
      date: new Date(
        post.querySelector(".tgme_widget_message_service_date")?.innerHTML +
          ", " +
          year
      ),
      content: post.querySelector(".tgme_widget_message_text.js-message_text")
        ?.innerHTML,
      source: "TELEGRAM_DCC",
    }));
  });

  await context.close();
  await browser.close();
  return offers;
}

export async function getJobsFromPage(page: number) {
  return pipe(
    await fetch(
      `https://www.getonbrd.com/api/v0/categories/programming/jobs?page=${page}&country_code=CL`
    ),
    async (result) => await result.json()
  );
}

export async function getOffersFromGetonboard() {
  const firstPage = await getJobsFromPage(1);
  const entryJobs = (
    await Promise.all(
      numberToArray(firstPage.meta.total_pages).map(async (page) => {
        // modality 4 = internship, seniortiy 1 = no experience required
        return pipe(
          await getJobsFromPage(page),
          (x) =>
            x.data.filter(
              (offer) =>
                offer.attributes.modality.data.id === 4 ||
                offer.attributes.seniority.data.id === 1
            ),
          (x) =>
            x.map((offer) => ({
              id: offer.id,
              date: new Date(offer.attributes.published_at * 1000),
              content: `${offer.attributes.title} <br /> ${offer.attributes.description} <br /> ${offer.attributes.functions} <br /> ${offer.attributes.desirable} <br /> ${offer.attributes.benefits}`,
              source: "GETONBOARD_CHILE",
            }))
        );
      })
    )
  ).flat(Infinity);
  return entryJobs;
}

function numberToArray(number: number) {
  const array = [...Array(number + 1).keys()];
  array.shift(); // remove 0
  return array;
}
