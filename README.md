# ☀️ RayAI — Serverless AI News Aggregator

A zero-cost, serverless agent that aggregates AI news from 23+ RSS feeds, synthesizes a daily morning briefing via an LLM, and delivers it to your Telegram chat.

## Architecture

```
Vercel Cron (daily)
    │
    ▼
┌─────────────────────┐
│   api/cron.ts       │  ← Serverless Function
│                     │
│  1. Fetch 23+ RSS   │
│  2. Filter 24h      │
│  3. LLM Briefing    │
│  4. Telegram Send    │
└─────────────────────┘
```

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd rayai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env`:

| Variable | Required | Description |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | ✅ | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | ✅ | Your chat ID (use [@userinfobot](https://t.me/userinfobot)) |
| `LLM_PROVIDER` | ✅ | `gemini` (default) or `openai` |
| `GEMINI_API_KEY` | If Gemini | From [Google AI Studio](https://aistudio.google.com/apikey) |
| `OPENAI_API_KEY` | If OpenAI | From [OpenAI Platform](https://platform.openai.com/api-keys) |
| `CRON_SECRET` | Optional | Secures the cron endpoint |

### 3. Test Locally

```bash
npx vercel dev
# In another terminal:
curl http://localhost:3000/api/cron
```

### 4. Deploy to Vercel

```bash
npx vercel --prod
```

Then set your environment variables in the [Vercel Dashboard](https://vercel.com/dashboard) under **Settings → Environment Variables**.

The cron job runs daily at **2:00 AM UTC** (~7:30 AM IST). Configure in `vercel.json`.

## Project Structure

```
rayai/
├── api/
│   └── cron.ts          # Main serverless endpoint
├── src/
│   ├── config.ts        # Environment variable loader
│   ├── feeds.ts         # Curated RSS feed list
│   ├── fetcher.ts       # Parallel RSS fetcher
│   ├── filter.ts        # 24h filter + deduplication
│   ├── llm.ts           # Gemini / OpenAI integration
│   ├── telegram.ts      # Smart chunking + delivery
│   └── types.ts         # TypeScript interfaces
├── vercel.json          # Cron configuration
├── package.json
└── tsconfig.json
```

## Feed Sources

23 curated feeds across: **Labs & Research** (OpenAI, Google AI, DeepMind, Anthropic, Meta AI, Microsoft) · **Open Source** (Hugging Face, LangChain, Ollama) · **Academic** (arXiv cs.AI/CL/LG) · **Industry** (TechCrunch, The Verge, Ars Technica, VentureBeat, Wired) · **Newsletters** (MIT Tech Review, The Batch, Import AI, Last Week in AI)

## License

MIT
