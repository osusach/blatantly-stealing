import { stealJobOffers, classifyJob } from "./lib";

async function app() {
  // no es robar si es un telegram publico, uwu
  console.log("💰 stealing from the rich...");
  const offers = await stealJobOffers();
  console.log("💰 hehe, found", offers.length, "jobs");
  console.log("🦙 stupid llama clocking-in...");
  const rawClassifiedJobs: any[] = []; // may contain null values
  for (const offer of offers) {
    rawClassifiedJobs.push(await classifyJob(offer));
    await new Promise((resolve) => setTimeout(resolve, 250)); // bypass rate limit
  }
  console.log("🦙 stupid llama finished his 9 to 5...");
  const classifiedJobs = rawClassifiedJobs.filter((job) => !!job);
  console.log(
    "🦙 his stupid ass classifed",
    classifiedJobs.length,
    "/",
    rawClassifiedJobs.length
  );
  console.log(classifiedJobs);
}

app();
