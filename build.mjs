import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHighlighter } from "shiki";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, "public");
const escape = (s) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

// Five minutes: about 30 seconds a slide. Each code slide has at most three highlights.
const slides = [
  {
    kind: "cover",
    chapter: "CalHacks / Droid SDK",
    title: "Put an agent in your hack.",
    subtitle:
      "The Droid SDK gives your app a coding agent in a few lines of TypeScript.",
    presenter: ["David G.", "𝕏 @agent_wrap"],
    meta: "CalHacks · 5 minutes",
  },
  {
    kind: "code",
    chapter: "01 / Setup",
    title: "Set up in one minute.",
    signature: "Node 20+ · the droid CLI · an API key",
    file: "get-started.sh",
    language: "bash",
    points: [
      ["Install the CLI", ["curl -fsSL"], "The SDK starts droid for you, so it must be on PATH."],
      ["Add the SDK", ["npm install"], "One package. Node APIs come from @factory/droid-sdk/node."],
      ["Set your key", ["FACTORY_API_KEY"], "Create a key at app.factory.ai/settings/api-keys. The SDK reads it from the environment."],
    ],
    // Same endpoints as DESKTOP_DOWNLOAD_CONFIG in the web app; each redirects to the latest installer.
    downloads: {
      label: "Also get Factory Desktop",
      links: [
        ["macOS (Apple Silicon)", "https://api.factory.ai/api/desktop?platform=darwin&architecture=arm64"],
        ["macOS (Intel)", "https://api.factory.ai/api/desktop?platform=darwin&architecture=x64"],
        ["Windows", "https://api.factory.ai/api/desktop?platform=win32"],
      ],
    },
  },
  {
    kind: "code",
    chapter: "02 / run()",
    title: "One prompt, one answer.",
    signature: "run(prompt, options?) → Promise<DroidResult>",
    file: "run.ts",
    points: [
      ["Send a prompt", ["const prompt", "run(prompt"], "Droid reads the files in cwd, uses its tools and finishes the task."],
      ["Read the answer", ["result.text"], "The final text of the agent. run() closes its session for you."],
    ],
  },
  {
    kind: "code",
    chapter: "03 / Structured output",
    title: "Get JSON your code can use.",
    signature: "run(prompt, { outputFormat: { type, schema } })",
    file: "structured-output.ts",
    points: [
      ["Describe the shape", ["z.strictObject", "z.enum"], "A Zod schema with fixed labels: the agent must pick from these lists."],
      ["Pass it to run()", ["outputFormat:", "OutputFormatType.JsonSchema"], "Send the schema as JSON Schema with the prompt."],
      ["Branch on typed data", ["Triage.parse", "ticket.severity"], "Parse structuredOutput and use it like any other object."],
    ],
  },
  {
    kind: "code",
    chapter: "04 / Sessions",
    title: "Keep a conversation going.",
    signature: "createSession(options?) → session.stream(prompt)",
    file: "chat.ts",
    points: [
      ["Open a session", ["createSession"], "A session keeps context across prompts. Close it when you finish."],
      ["Send follow-ups", ["const prompts", "for (const prompt"], "The second prompt says \u201cit\u201d. Droid knows it means the bug from the first turn."],
      ["Stream the work", ["session.stream(prompt)", "DroidMessageType.Assistant"], "Events arrive as the agent works. Show them live in your UI."],
    ],
  },
  {
    kind: "browser",
    chapter: "05 / Daemon",
    title: "Drive it from a web page.",
    lede: "Start a Droid daemon on any machine. Your web app connects over a WebSocket and runs sessions there.",
    command: 'droid daemon --port 37643  ·  connectToDaemon({ url, auth })',
    cards: [
      ["Your web app", "Import connectToDaemon() from @factory/droid-sdk. It has no Node built-ins, so any bundler can ship it."],
      ["WebSocket", "ws:// to localhost while you build, wss:// to a remote host for the demo."],
      ["Daemon", "Runs the sessions on its host and streams messages back to the page."],
    ],
    notice: "Do not put a real API key in a public web page.",
  },
  {
    kind: "topics",
    chapter: "06 / Use cases",
    title: "What you can build this weekend.",
    cards: [
      ["An agent in your app", "A \u201cfix it\u201d button in a dashboard, an internal tool or a support flow."],
      ["Chat bots", "Start work from Discord, Slack or Telegram. Post the result back to the thread."],
      ["Repo tools", "Explain a codebase, write onboarding docs or turn an issue into a pull request."],
      ["CI bots", "Review pull requests, triage issues with structured output, fix a failing test."],
      ["Multi-agent apps", "Run several sessions at once and let one agent hand work to the others."],
      ["Tutors", "Read a student\u2019s code, explain each error and suggest the next step."],
    ],
  },
  {
    kind: "showcase",
    chapter: "07 / Built on the SDK",
    title: "Factory runs on it too.",
    shots: [
      {
        src: "assets/built/desktop.jpg",
        alt: "Factory Desktop with a session list, a Droid session and a code preview",
      },
    ],
    via: "@factory/daemon-sdk · droid exec",
    details: [
      ["Desktop and web", "Both connect to a Droid daemon with the same client that connectToDaemon() uses."],
      ["The Droid CLI", "The droid TUI runs its sessions through the daemon too."],
      ["Slack and Linear", "Mention @Factory and the backend starts a session on a Droid computer."],
    ],
    credit: "Image: factory.ai/news/factory-desktop",
  },
  {
    kind: "showcase",
    chapter: "07 / Built on the SDK",
    title: "Built by the community.",
    community: true,
    shots: [
      {
        src: "assets/built/droidex.jpg",
        alt: "DROIDEX: a lead agent hands threads to Droid, Claude Code and Codex",
        name: "DROIDEX",
        caption: "One desktop app for Droid, Claude Code and Codex. Its sidecar uses ProcessTransport from @factory/droid-sdk.",
      },
      {
        mock: "telegram",
        alt: "Illustration of a Telegram chat with a Droid bot",
        name: "droid-telegram-bot",
        caption: "Chat with Droid from Telegram. Each message runs droid exec in stream-json mode. Illustration.",
      },
    ],
    uses: [
      ["Meta-harness tools", "One app that runs and coordinates many agents."],
      ["Droid in a product", "An agent inside a tool your users already open."],
      ["Chat and ops bots", "Start work from a chat or a schedule, then report back."],
    ],
  },
  {
    kind: "close",
    chapter: "Get started",
    title: "Go build something.",
    links: [
      ["Install", "The SDK", "npm install @factory/droid-sdk"],
      ["Examples", "Runnable examples", "github.com/Factory-AI/droid-sdk-typescript"],
      ["Reference", "SDK docs", "docs.factory.ai/sdk/typescript"],
    ],
    handle: "𝕏 @agent_wrap",
  },
];

const highlighter = await createHighlighter({
  themes: ["github-dark"],
  langs: ["typescript", "bash"],
});
for (const slide of slides.filter((s) => s.file)) {
  const source = await readFile(path.join(root, "lessons", slide.file), "utf8");
  const visible = source
    .trimEnd()
    .split("\n")
    .map((text, i) => ({ text, line: i + 1 }))
    .filter(({ text }) => text.trim() && !text.trimStart().startsWith("//"));
  slide.excerpt = visible.map(({ text }) => text).join("\n");
  slide.lineNumbers = visible.map(({ line }) => line);
  for (const point of slide.points) {
    if (!point[1].some((needle) => slide.excerpt.includes(needle)))
      throw new Error(`Missing highlight in ${slide.title}: ${point[0]}`);
  }
  slide.highlightedLines = highlighter
    .codeToTokens(slide.excerpt, {
      lang: slide.language ?? "typescript",
      theme: "github-dark",
    })
    .tokens.map((tokens) =>
      tokens
        .map(({ content, color }) => {
          const ink =
            !color || color.toLowerCase() === "#e1e4e8" ? "#D2CCC7" : color;
          return `<span class="syntax-token" style="color:${ink}">${escape(content)}</span>`;
        })
        .join(""),
    );
}
highlighter.dispose();
for (const slide of slides) slide.title = slide.title.replace(/\.$/, "");
await writeFile(path.join(publicDir, "slides.json"), JSON.stringify(slides, null, 2));
console.log(`Built ${slides.length} slides.`);
