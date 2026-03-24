# Finsery Editorial — Next.js

A full-stack editorial content management system built with Next.js, Supabase, and Cerebras AI.

## Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Auth + DB:** Supabase
- **AI:** Cerebras (llama-3.3-70b)
- **CMS:** WordPress REST API
- **Deploy:** Vercel

## Features
- Login / Signup with Supabase Auth
- Pick Topic from RSS feed (US News Money)
- Write your own topic
- Full Content Specs form (20 fields)
- AI content generation with Cerebras
- Inline draft editing
- Push to WordPress as draft
- Library of all generated drafts
- Admin panel (manage editors, roles)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to https://supabase.com/dashboard/project/pcrboszzhvzvhyhinvxq/sql
2. Run the entire contents of `supabase-schema.sql`
3. After signing up, run this to make yourself admin:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 3. Add your Cerebras API key
Open `.env.local` and replace:
```
CEREBRAS_API_KEY=your_cerebras_api_key_here
```
Get your key from: https://cloud.cerebras.ai

### 4. Run locally
```bash
npm run dev
```
Open: http://localhost:3000

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel
```
Add all `.env.local` variables in Vercel dashboard → Settings → Environment Variables.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://pcrboszzhvzvhyhinvxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
CEREBRAS_API_KEY=your_cerebras_key
WP_URL=https://finsery-staging.com
WP_USERNAME=Sasank Sharma
WP_APP_PASSWORD=qLyC HxNm FSGW 0rot 2nIi 9nKc
RSS_FEEDS=https://www.usnews.com/rss/money
```

## Routes
| Route | Page |
|---|---|
| `/login` | Login |
| `/signup` | Signup |
| `/dashboard` | Pick Topic (RSS) |
| `/dashboard/write` | Write a Topic |
| `/dashboard/specs` | Content Specs Form |
| `/dashboard/generate` | Generating Draft |
| `/dashboard/draft/[id]` | Draft Viewer + Editor |
| `/admin` | Admin Panel (admin only) |
