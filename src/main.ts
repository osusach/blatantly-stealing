import { getDccTelegramJobs } from "./sources/dcc";
import { getGetonboardJobs } from "./sources/getonboard";
import { save } from "./lib/save";

async function main() {
  const [dccResult, getonboardResult] = await Promise.allSettled([
    getDccTelegramJobs(),
    getGetonboardJobs(),
  ]);

  if (dccResult.status === "rejected")
    console.log("error getting dcc jobs", dccResult.reason);
  if (getonboardResult.status === "rejected")
    console.log("error getting getonboard jobs", getonboardResult.reason);

  const dccJobs = dccResult.status === "fulfilled" ? dccResult.value : [];
  const getonboardJobs =
    getonboardResult.status === "fulfilled" ? getonboardResult.value : [];

  const jobs = [...dccJobs, ...getonboardJobs];

  if (jobs.length === 0) {
    console.log("no jobs found");
    return;
  }

  const results = await save(jobs);
  if (results.isErr()) {
    console.log("error saving jobs", results.error);
  } else {
    console.log(
      results.value.fulfilled +
        " jobs saved" +
        results.value.rejected +
        " failed"
    );
  }
  return;
}

main();
