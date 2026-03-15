# Side Project Evaluator

An AI-powered evaluation system that analyzes your side project across six dimensions and estimates its dollar value based on real-world acquisition comparables.

Submit a text description or a GitHub repository URL, and six specialized AI evaluators run in parallel to produce a scored report with strengths, improvements, a valuation tier, and matching real-world project comparisons.

---

## Features

- **6 specialized AI evaluators** running in parallel (Tech, Market, UX, Feasibility, Growth, Risk)
- **Acquisition-aligned scoring weights** — categories are weighted to reflect what buyers and hiring managers value most
- **Dollar valuation** — maps your total score to a realistic market value range based on comparable transactions
- **Real-world comparable matching** — surfaces similar projects (e.g., Wordle, Plausible, Buttondown, Cal.com) that reached similar outcomes
- **Leaderboard** — compare your project against all previously evaluated projects
- **GitHub repo analysis** — when a GitHub URL is provided, the system reads the repo structure, README, languages, CI/CD setup, commit history, and open issues to enrich the evaluation
- **Confidence rating** — high/medium/low confidence based on how much information was available
- **Cross-category consistency checks** — prevents inflated scores in one area when a dependent area is critically weak

---

## Scoring System

Each evaluator scores its category out of its maximum weight. The weights are intentionally unequal because they reflect how acquirers and investors actually price projects.

| Category | Max Points | Rationale |
|---|---|---|
| Market Fit | 30 | The largest single driver of value — a project solving a real, large problem is worth far more than a technically polished one with no market |
| Growth Potential | 25 | Revenue model, distribution, and scalability determine long-term upside |
| Risk Assessment | 15 | High-risk projects are discounted heavily at acquisition; this category penalizes dependency risks, legal exposure, and competitive threats |
| Technical Quality | 10 | Table stakes — necessary but not sufficient; buyers can hire engineers |
| User Experience | 10 | UX quality signals whether users will actually adopt and retain |
| Feasibility | 10 | Realistic scope and timeline estimates reduce execution risk |
| **Total** | **100** | |

### Why Market (30) and Growth (25) are weighted highest

In real acquisition markets (Acquire.com, Flippa, strategic buys), value is almost entirely determined by whether the project addresses a meaningful problem and whether it can grow. A CRUD app with beautiful UI but no user demand sells for almost nothing. A scrappy app with strong organic traction sells for multiples of revenue. These weights encode that reality.

### Verdicts

| Score Range | Verdict |
|---|---|
| 75 – 100 | PASS |
| 55 – 74 | CONDITIONAL PASS |
| 35 – 54 | NEEDS WORK |
| 0 – 34 | FAIL |

> **Floor rule**: If any single category scores below 25% of its maximum, the verdict cannot be PASS regardless of the total score.

### Grades per category

Each category receives a letter grade: A (≥90%), B (≥75%), C (≥60%), D (≥40%), F (<40%).

---

## Valuation Tiers

Dollar value is interpolated within the matched tier based on the exact score.

| Tier | Score Range | Value Range | Description |
|---|---|---|---|
| Learning Project | 0 – 10 | $0 – $500 | Personal learning, no market value |
| Portfolio Starter | 11 – 25 | $500 – $3,000 | Junior portfolio, ~$2-5K salary premium |
| Hiring Signal | 26 – 35 | $3,000 – $10,000 | Flippa small-scale deal, ~$5-10K salary premium |
| Early Product | 36 – 54 | $10,000 – $40,000 | Acquire.com lower tier, early traction |
| Growth Project | 55 – 74 | $40,000 – $150,000 | Acquire.com mid-tier, revenue-generating stage |
| Acquisition Target | 75 – 89 | $150,000 – $500,000 | Acquire.com upper tier, acqui-hire range |
| Viral / Exit-Ready | 90 – 100 | $500,000 – $2,000,000 | Strategic acquisition (e.g., Wordle → NYT) |

---

## Comparable Projects Database

The system matches your project against a curated set of real outcomes:

- **Score 90-100**: Wordle ($1-5M to NYT), I Done This (~$1M on Acquire.com)
- **Score 75-89**: Plausible Analytics ($1M+ ARR), Buttondown ($500K+/yr), Carrd ($1M+ ARR)
- **Score 55-74**: Typebot, Cal.com (early), Dub.co (early)
- **Score 36-54**: Umami Analytics, Flippa median SaaS ($10-40K)
- **Score 26-35**: RealWorld (gothinkster), HN clone (hiring portfolio)
- **Score 11-25**: Personal blog/portfolio, Hackathon MVP
- **Score 0-10**: TODO MVC clone, tutorial follow-along

Tag-based matching is applied when available so that, for example, a B2B SaaS project surfaces B2B comparables before generic ones.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma |
| AI — primary | Google Gemini (via `@ai-sdk/google`) |
| AI — fallback | OpenRouter (via `@ai-sdk/openai-compatible`) |
| AI SDK | Vercel AI SDK v6 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key for Gemini
- (Optional) An [OpenRouter](https://openrouter.ai) API key as fallback

### Installation

```bash
git clone https://github.com/MunhyeongKIm/eval-side.git
cd eval-side
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Google Gemini (primary AI)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"

# OpenRouter (fallback AI — optional but recommended)
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

To seed the database with initial data (optional):

```bash
npx prisma db seed
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
eval-side/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home — project submission form
│   │   ├── projects/[id]/        # Individual evaluation report page
│   │   ├── leaderboard/          # Ranked list of all evaluations
│   │   └── api/                  # API routes (evaluation endpoint)
│   ├── components/
│   │   ├── Header.tsx
│   │   └── ProjectCard.tsx
│   └── lib/
│       ├── types.ts              # Shared TypeScript interfaces
│       ├── evaluator.ts          # Main orchestrator — runs all 6 evaluators in parallel
│       ├── ai-client.ts          # Gemini + OpenRouter AI client with fallback logic
│       ├── ai-prompts.ts         # System prompts for each evaluator
│       ├── valuation.ts          # Tier definitions and dollar value calculation
│       ├── comparables.ts        # Real-world comparable project database
│       └── evaluators/
│           ├── tech-evaluator.ts
│           ├── market-evaluator.ts
│           ├── ux-evaluator.ts
│           ├── feasibility-evaluator.ts
│           ├── growth-evaluator.ts
│           └── risk-evaluator.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── package.json
```

---

## How It Works

```
User Input
  │
  ├── Text concept description
  └── GitHub repository URL
         │
         ▼
  [GitHub Analysis] (if URL provided)
  Reads: repo structure, README, languages, CI/CD,
         commit frequency, stars, forks, open issues
         │
         ▼
  [6 Parallel AI Evaluations]
  ┌──────────────┬────────────────┬─────────────┐
  │ Tech (10pts) │ Market (30pts) │  UX (10pts) │
  └──────────────┴────────────────┴─────────────┘
  ┌──────────────────┬──────────────┬────────────┐
  │ Feasibility(10pt)│ Growth(25pt) │ Risk(15pt) │
  └──────────────────┴──────────────┴────────────┘
         │
         ▼
  [Cross-category Consistency Check]
  Prevents inflated scores in dependent categories
         │
         ▼
  [Score Aggregation + Verdict]
  Total 0–100, PASS / CONDITIONAL PASS / NEEDS WORK / FAIL
         │
         ▼
  [Dollar Valuation]
  Maps score to a tier + interpolated dollar value
         │
         ▼
  [Comparable Matching]
  Finds the 3 most similar real-world project outcomes
         │
         ▼
  [AI Summary Generation]
  Synthesizes findings into a human-readable narrative
         │
         ▼
  Evaluation Report saved to PostgreSQL
  Displayed on report page + leaderboard
```

### Evaluation Confidence

| Input Type | AI Success | Confidence |
|---|---|---|
| Text concept | Any | Low |
| GitHub URL | Partial AI responses | Medium |
| GitHub URL | All 6 AI calls succeed | High |

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

This project is private. See `package.json` for details.
