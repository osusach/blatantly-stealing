import { chromium } from "playwright";
import type { Job } from "./schema";

export async function getDccTelegramJobs(): Promise<Job[]> {
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
        .getAttribute("data-post")!,
      date: new Date(
        post.querySelector(".tgme_widget_message_service_date")?.innerHTML +
          ", " +
          year
      ),
      content: post
        .querySelector(".tgme_widget_message_text.js-message_text")
        ?.innerHTML.trim()!,
      source: "DCC_TELEGRAM" as const,
    }));
  });

  await context.close();
  await browser.close();
  return offers;
}
