import { createClient } from "@libsql/client";
import { Result } from "neverthrow";

export const createConnection = Result.fromThrowable(() =>
  createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
  })
);
