import { createClient } from "@libsql/client";
import { Job } from "../sources/schema";
import keywordList from "../keywordList";
import { createConnection } from "./db";
import { err, ok } from "neverthrow";

export async function save(jobs: Job[]) {
  const conn = createConnection();
  if (conn.isErr()) return err("can't stablish connection with database");

  const promises = jobs.map(
    async (job) =>
      await conn.value.execute({
        sql: "INSERT INTO goodies (id, date, content, keywords, source) values (?, ?, ?, ?, ?)",
        args: [
          job.id,
          job.date.toDateString(),
          job.content,
          GetKeywords(job.content),
          job.source,
        ],
      })
  );
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  return ok({
    fulfilled: results.length - rejected.length,
    rejected: rejected.length,
  });
}

// LEGACY
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
