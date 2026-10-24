# Droid SDK at CalHacks

A 5-minute introduction to the [Droid TypeScript SDK](https://github.com/Factory-AI/droid-sdk-typescript): setup, `run()`, structured output, sessions, the browser daemon client, use cases and apps built on the SDK.

## Layout

- `build.mjs`: the slide content. It reads code excerpts from `lessons/`, highlights them with Shiki and writes `public/slides.json`.
- `lessons/`: the complete example files shown on the slides.
- `public/`: the static site (`index.html`, `deck.js`, `deck.css`, assets and the built `slides.json`).

## Commands

```bash
npm install
npm run build       # regenerate public/slides.json
npm run typecheck   # typecheck lessons/ against the published SDK
```

The QR code on the last slide is `public/assets/qr-sdk.svg`. To make it again:

```bash
npx qrcode@1.5.4 -t svg -e M -m 2 -d 000000ff -l ffffffff -o public/assets/qr-sdk.svg "https://github.com/Factory-AI/droid-sdk-typescript"
```

Commit `public/slides.json` after a build. The GitHub Pages workflow publishes `public/` as it is and does not run the build.

## Controls

Arrow keys or Space step through slides and code highlights. Each slide has a shareable `#/slide/build` URL. Touch users can swipe.

## Run the examples

Use Node 20 or later, install the Droid CLI (`curl -fsSL https://app.factory.ai/cli | sh`), run `npm install @factory/droid-sdk zod tsx`, and set `FACTORY_API_KEY`. Then run a file, for example `npx tsx lessons/run.ts`.
