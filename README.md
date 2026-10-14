# myApplicationSubmit — Pitch Studio

A private tool that turns any business into a pitch-ready demo. Drop in a
company / shop / gym / restaurant as **text, a website link, or a screenshot**,
and it uses **Claude** to:

1. Extract a clean structured profile of the business
2. Build a premium, animated **demo website** (live preview + downloadable HTML)
3. Write a personalised **cold-outreach proposal email**

## Stack
- Next.js 16 (App Router) · Tailwind CSS v4 · Motion
- Anthropic Claude (`claude-opus-5-5`) via the official SDK, called from a Next.js API route

## Setup
```bash
npm install
# add your Anthropic API key (separate from Claude Max — this is pay-per-token API billing)
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```
Without a key, the app runs in **sample mode** so the whole UI is usable for testing.

On Vercel, add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables.

Built by Rimon Debnath.
