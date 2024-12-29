import { saveOffers } from "./lib/save";
import { getDevKoreaEntryLevelOffers } from "./sources/devkorea";
import { getGetonboardEntryLevelOffers } from "./sources/getonboard";
import { getTokyoDevEntryLevelJobs } from "./sources/tokyodev";

(async () => {
  const [devKoreaOffers, getonboardOffers, tokyodevOffers] = await Promise.all([
    getDevKoreaEntryLevelOffers(),
    getGetonboardEntryLevelOffers(),
    getTokyoDevEntryLevelJobs(),
  ]);
  const all = [...devKoreaOffers, ...getonboardOffers, ...tokyodevOffers];
  await saveOffers(all);
  process.exit(0);
})();
