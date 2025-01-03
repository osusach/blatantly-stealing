import { createClient } from "@libsql/client/web";
import { Result } from "neverthrow";
import { z } from "zod";

export const createConnection = Result.fromThrowable(() =>
  createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
  })
);

export const OfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.union([z.string(), z.null()]),
  url: z.string(),
  seniority: z.union([z.literal("NOEXPERIENCE"), z.literal("JUNIOR")]),
  salary: z.string().optional(),
  // base location is Chile, remote means remote within Chile
  location: z.union([
    z.literal("JAPAN"),
    z.literal("KOREA"),
    z.literal("REMOTE"),
    z.literal("ONSITE"),
  ]),
  published_at: z.date(),
  source: z.union([
    z.literal("GETONBOARD"),
    z.literal("TOKYODEV"),
    z.literal("DEVKOREA"),
    z.literal("DCCTELEGRAM"),
    z.literal("JAPANDEV"),
  ]),
});

export type Offer = z.infer<typeof OfferSchema>;
