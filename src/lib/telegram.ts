import { Bot } from "grammy";
import { ResultAsync } from "neverthrow";
import { jobSchema } from "../sources/schema";
import { save } from "./save";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export async function unsafeDCCListener() {
  if (!TOKEN) throw new Error("no telegram bot token found in .env");
  const bot = new Bot(TOKEN);
  bot.on("channel_post", (ctx) => {
    if (ctx.chat.title === "DCCEmpleo") {
      const job = jobSchema.safeParse({
        id: `${ctx.channelPost.message_id}_DCCEmpleo`,
        content: ctx.channelPost.text,
        date: new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/Santiago" })
        ),
        source: "DCC_TELEGRAM",
      });

      if (job.success) {
        save([job.data]);
      } else {
        console.error(job.error);
      }
    }
  });

  await bot.start({
    onStart() {
      console.info("telegram bot is runnning");
    },
  });
}

export const dccListener = ResultAsync.fromThrowable(
  unsafeDCCListener,
  (error) => (error instanceof Error ? error : new Error("Unknown error"))
);
