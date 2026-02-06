# the days are getting longer

A shared journal by Jacky and Dom, built with **Next.js** and **Sanity CMS**. Anyone can read it; only the two authors can write, and each can only edit their own entries.

The site title is dynamic -- it shows today's daylight duration for London and whether the days are getting longer or shorter. It changes every day.

## Stack

- **Next.js 16** (App Router) -- public site
- **Sanity v3** -- headless CMS with embedded Studio at `/studio`
- **Tailwind CSS v4** -- styling
- **Vercel** -- deployment

## Getting Started

### 1. Create a Sanity Project

1. Go to [sanity.io/manage](https://www.sanity.io/manage) and create a new project
2. Note your **Project ID**
3. Create a dataset called `production` (or any name you prefer)
4. Under **API** settings, add `http://localhost:3000` to the CORS origins (with credentials allowed)

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Sanity project details:

```
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-01-01"
```

### 3. Install & Run

```bash
npm install
npm run dev
```

- **Public site**: [http://localhost:3000](http://localhost:3000)
- **Sanity Studio**: [http://localhost:3000/studio](http://localhost:3000/studio)

### 4. Set Up Authors

1. Go to `/studio` and log in
2. Create two **Author** documents -- one for Jacky, one for Dom
3. For each, set the **email** field to match the Sanity login email
4. Invite Dom to the Sanity project at [sanity.io/manage](https://www.sanity.io/manage) -> Members

### 5. Start Writing

1. Create a new **Journal Entry** -- the author is auto-assigned based on who's logged in
2. Fill in title, date, body, photos, tags, mood
3. Click **Publish**
4. Only the author of an entry can edit or publish it; the other person sees it as read-only

## Project Structure

```
├── sanity.config.ts              # Studio config + owner-only actions
├── src/
│   ├── app/
│   │   ├── (site)/               # Public site
│   │   │   ├── page.tsx          # Homepage -- latest entries
│   │   │   ├── journal/          # Timeline + entry pages
│   │   │   ├── tags/[tag]/       # Entries filtered by tag
│   │   │   └── about/            # About page
│   │   └── studio/               # Sanity Studio (auth required)
│   ├── components/               # Header, EntryCard, PhotoGallery, etc.
│   ├── sanity/
│   │   ├── schemas/              # Entry + Author schemas
│   │   ├── components/           # AuthorAutoAssign custom input
│   │   ├── plugins/              # ownerOnly edit restriction
│   │   └── lib/                  # Client, queries, image helpers
│   └── lib/
│       ├── daylight.ts           # Daylight calculation (London lat 51.5)
│       ├── types.ts              # TypeScript interfaces
│       └── utils.ts              # Date formatting, etc.
```

## Features

- **Dynamic title** -- shows daily daylight duration + direction ("10h 42m of light -- getting longer")
- **Two-author system** -- auto-assigned author, ownership-based edit restrictions
- **Typewriter typography** -- Courier New monospace for content
- **Light/dark mode** -- system preference + manual toggle
- **Photo gallery** -- grid layout with lightbox and keyboard navigation
- **Portable Text** -- rich content with headings, quotes, inline images
- **Tags + mood** -- organize and categorize entries

## Deploying to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Set env vars (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`)
4. Add your production domain to Sanity CORS origins
5. Deploy
