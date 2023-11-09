import { getOffersFromTelegram, getOffersFromGetonboard } from "./lib";

async function app() {
  console.log(await getOffersFromGetonboard());
  console.log(await getOffersFromTelegram());
}

app();
