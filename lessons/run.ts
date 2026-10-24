import { run } from "@factory/droid-sdk/node";

const prompt = "Explain what this repository does in one sentence.";
const result = await run(prompt);

console.log(result.text);
