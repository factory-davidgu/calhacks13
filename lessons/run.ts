import { run } from "@factory/droid-sdk/node";

const prompt = "Explain what this repository does in one sentence.";
const cwd = ".";
const result = await run(prompt, { cwd });

console.log(result.text);
