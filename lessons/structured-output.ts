import { OutputFormatType, run } from "@factory/droid-sdk/node";
import { z } from "zod/v4";

const Triage = z.strictObject({
  category: z.enum(["bug", "feature", "question"]),
  severity: z.enum(["low", "medium", "high"]),
  area: z.string(),
});
const issue = "The app crashes when I upload a PNG larger than 10 MB.";
const prompt = `Classify this issue for triage: ${issue}`;
const result = await run(prompt, {
  outputFormat: {
    type: OutputFormatType.JsonSchema,
    schema: z.toJSONSchema(Triage, { target: "draft-7" }),
  },
});

const ticket = Triage.parse(result.structuredOutput);
if (ticket.severity === "high") console.log("Page on-call for", ticket.area);
