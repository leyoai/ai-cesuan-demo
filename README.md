<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f0e718bc-6c80-4f16-a6db-8015c45d604e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Optional: copy `.env.example` to `.env.local`. Local development runs in offline fallback mode by default to avoid external API reconnects on startup.
3. To use Gemini, set `ENABLE_GEMINI="true"` and `GEMINI_API_KEY` in `.env.local`.
4. Run the app:
   `npm run dev`
