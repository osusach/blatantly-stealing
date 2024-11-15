import { Cron } from "croner";
import { getDccTelegramJobs } from "./sources/dcc";
import { getGetonboardJobs } from "./sources/getonboard";
import { save } from "./lib/save";
import pino from "pino";

const EVERY_DAY_AT_8AM = "0 8 * * *";
const EVERY_5_SECONDS = "*/5 * * * * *";

const logger = pino();

async function app() {
  new Cron(EVERY_DAY_AT_8AM, steal);
  // TODO: make a listener for telegram channel updates on dcc @panquequelol
}

app();

async function steal() {
  // TODO: fix dcc, since last update you can't preview channels from the web in telegram
  // const [dcc, getonboard] = await Promise.allSettled([
  //   getDccTelegramJobs(),
  //   getGetonboardJobs(),
  // ]);
  const [getonboard] = await Promise.allSettled([getGetonboardJobs()]);

  // if (dcc.status === "rejected")
  //   logger.error("couldn't steal from dcc", dcc.reason);
  if (getonboard.status === "rejected")
    logger.error(`couldn't steal from getonboard ${getonboard.reason}`);

  const jobs = [
    // ...(dcc.status === "fulfilled" ? dcc.value : []),
    ...(getonboard.status === "fulfilled" ? getonboard.value : []),
  ];

  if (jobs.length === 0) {
    logger.info("no new jobs found");
    return;
  }

  const results = await save(jobs);
  if (results.isErr()) {
    logger.error(`coudn't save new jobs, ${results.error}`);
  } else {
    logger.info(
      "saved " +
        results.value.fulfilled +
        ", " +
        results.value.rejected +
        " failed"
    );
  }
  return;
}
