import { z } from "zod";

const source = ["DCC_TELEGRAM", "GETONBOARD_CHILE"] as const;
export type Source = typeof source;
export const jobSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String), // Ensures id is always a string
  date: z.date(),
  content: z.string(),
  source: z.enum(source),
});
export type Job = z.infer<typeof jobSchema>;
