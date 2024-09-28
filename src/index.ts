import { Client, createClient } from "@libsql/client";
import keywordList from "./keywordList";
import { Job } from "./sources/schema";
import { getEntryLevelJobsFromDCCTelegram } from "./sources/dcc";
import { getEntryLevelJobsFromGetonboard } from "./sources/getonboard";

const GetKeywords = (content: string) => {
  const keywords: string[] = [];
  const text = content.toLowerCase();

  keywordList.forEach((word) => {
    if (text.includes(word.toLowerCase())) {
      keywords.push(word);
    }
  });
  return keywords.join(",");
};

async function saveJobs(jobs: Job[], client: Client) {
  const promises = jobs.map(
    async (o) =>
      await client.execute({
        sql: "INSERT INTO goodies (id, date, content, keywords, source) values (?, ?, ?, ?, ?)",
        args: [
          o.id,
          o.date.toDateString(),
          o.content,
          GetKeywords(o.content),
          o.source,
        ],
      })
  );
  const results = await Promise.allSettled(promises);
  // find failed inserts
  const rejectedInserts = results.filter(
    (result) => result.status === "rejected"
  );
  return {
    fulfilled: results.length - rejectedInserts.length,
    rejected: rejectedInserts.length,
  };
}

async function app() {
  console.log("-------");
  console.log("start");
  console.log("-------");
  const client = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN,
  });

  const dccJobs = await getEntryLevelJobsFromDCCTelegram();
  console.log("found ", dccJobs.length, " jobs from dcc telegram");
  const getonboardJobs = await getEntryLevelJobsFromGetonboard();
  console.log("found ", getonboardJobs.length, " jobs from getonboard");

  const jobs = [...dccJobs, ...getonboardJobs];
  const results = await saveJobs(jobs, client);

  console.log("-------");
  console.log(
    "fin, ",
    results.fulfilled,
    " jobs were added",
    results.rejected,
    " failed to be saved"
  );
  console.log("-------");
}

app();
