import { createSession, DroidMessageType } from "@factory/droid-sdk/node";

const session = await createSession();
const prompts = ["Find the bug in src/app.ts.", "Fix it and run the tests."];

for (const prompt of prompts) {
  for await (const message of session.stream(prompt)) {
    if (message.type === DroidMessageType.Assistant) console.log(message.text);
  }
}

await session.close();
