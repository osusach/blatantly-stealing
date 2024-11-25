import { dccListener } from "./lib/telegram";

async function server() {
  console.log("runtime: " + process.release.name);
  const listener = await dccListener();
  if (listener.isErr()) {
    console.error(listener.error.message);
    return;
  }
}

server();
