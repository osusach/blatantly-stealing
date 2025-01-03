import dotenv from "dotenv";
dotenv.config();

import { saveOffers } from "@lib/save";
import { getDevkoreaEntryLevelOffers } from "@/sources/devkorea";
import { getGetonboardEntryLevelOffers } from "@/sources/getonboard";
import { getTokyodevEntryLevelJobs } from "@/sources/tokyodev";
import { getJapandevEntryLevelJobs } from "@/sources/japandev";
import { Offer } from "@lib/db";

async function cron() {
  const results = await Promise.allSettled([
    getDevkoreaEntryLevelOffers(),
    getGetonboardEntryLevelOffers(),
    getTokyodevEntryLevelJobs(),
    getJapandevEntryLevelJobs(),
  ]);

  const offers: Offer[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      offers.push(...result.value);
    } else {
      console.error(`Source ${index + 1} failed:`, result.reason);
    }
  });
  console.log(offers.length, "offers found");
  await saveOffers(offers);
  process.exit(0);
}

cron();
