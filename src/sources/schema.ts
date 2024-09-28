import { z } from "zod";

const source = ["DCC_TELEGRAM", "GETONBOARD_CHILE"] as const;
export type Source = typeof source;
export const JobSchema = z.object({
  id: z.string(),
  date: z.date(),
  content: z.string(),
  source: z.enum(source),
});
export type Job = z.infer<typeof JobSchema>;
