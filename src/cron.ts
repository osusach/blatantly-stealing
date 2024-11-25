import { save } from "./lib/save";
import { getGetonboardJobs } from "./sources/getonboard";

// TODO: normalize for multiple sources and use neverthrow
async function cron() {
  const [getonboard] = await Promise.allSettled([getGetonboardJobs()]);

  if (getonboard.status === "rejected")
    console.error(`couldn't steal from getonboard ${getonboard.reason}`);

  const jobs = [...(getonboard.status === "fulfilled" ? getonboard.value : [])];

  if (jobs.length === 0) {
    console.info("no new jobs found");
    return;
  }

  const results = await save(jobs);
  if (results.isErr()) {
    console.error(`coudn't save new jobs, ${results.error}`);
  } else {
    console.info(
      "saved " +
        results.value.fulfilled +
        ", " +
        results.value.rejected +
        " failed"
    );
  }
  return;
}

cron();
