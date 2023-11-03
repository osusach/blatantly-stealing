import { chromium } from "playwright";
import { SYSTEM_INSTRUCTIONS } from "./vars";

export async function stealJobOffers() {
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
      date:
        post.querySelector(".tgme_widget_message_service_date")?.innerHTML +
        ", " +
        year,
      content: post.querySelector(".tgme_widget_message_text.js-message_text")
        ?.innerHTML,
    }));
  });

  await context.close();
  await browser.close();

  return offers;
}

export async function classifyJob(offer: {
  date: string;
  content: string | undefined;
}) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-2-7b-chat-int8`,
      {
        headers: { Authorization: `Bearer ${process.env.CF_AI_TOKEN}` },
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTIONS,
            },
            {
              role: "user",
              content: `Classify this offer: ${offer.content} `,
            },
          ],
        }),
      }
    );

    const rawResponse = (await response.json()).result.response as string;
    const jsonResponse = rawResponse.substring(
      rawResponse.indexOf("{"),
      rawResponse.lastIndexOf("}") + 1
    );
    const parsedOffer = JSON.parse(jsonResponse);
    parsedOffer.tags = parsedOffer.tags.filter(
      (tag) =>
        ![
          "Software",
          "Engineer",
          "technology",
          "engineering",
          "development",
          "innovation",
          "ingenieria",
          "informatica",
          "práctica profesional",
          "ingeniería de software",
          "remunerado",
          "computacion",
          "informática",
          "Ingeniería en Computación",
          "Civil Informático",
          "Software engineering",
          "Programación",
          "Developer",
          "Desarrollador",
        ].some((keyword) => tag.includes(keyword))
    );
    const cleanedOffer = {
      company: parsedOffer.company,
      salary: parsedOffer.salary,
      date: offer.date,
      tech: parsedOffer.tech,
      tags: parsedOffer.tags,
      content: offer.content,
    };
    return cleanedOffer;
  } catch (error) {
    console.error("🍺 scheisse, llama did something stupid", error);
    return null;
  }
}
