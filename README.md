# Curated SHEIN

A premium affiliate curation and price-tracking engine for SHEIN products. Built with Next.js App Router, Tailwind CSS, Clerk, Neon Postgres, and Drizzle ORM.

## Features

- **Programmatic SEO lookbooks** — `/lookbook/[category]` pages with metadata and static generation
- **Product catalog** — `/product/[id]` detail pages with discount badges
- **Affiliate redirects** — `/go/[productId]` with server-side cookie tracking
- **Watchlist** — Clerk-authenticated price-drop saving at `/dashboard`
- **Bulk CSV upload** — Admin upsert at `/dashboard/admin`

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy `.env.example` to `.env.local` and fill in:

   - `DATABASE_URL` — Neon Postgres connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from [Clerk Dashboard](https://dashboard.clerk.com)
   - `SHEIN_AFFILIATE_ID` — your SHEIN affiliate ID
   - `ADMIN_USER_IDS` — comma-separated Clerk user IDs allowed to upload CSVs

3. **Run database migration**

   ```bash
   npm run db:push
   ```

   Or apply the SQL in `drizzle/0000_initial.sql` manually.

4. **Start dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## CSV Upload

Upload affiliate feed CSV at `/dashboard/admin` with columns:

| Column | Required |
|--------|----------|
| Product ID | Yes |
| Product Name | Yes |
| Image URL | Yes |
| Sale Price | No |
| Retail Price | No |
| Affiliate Link | Yes |
| Category | No |

## Project Structure

```
src/
├── app/
│   ├── actions/          # Server actions (watchlist, bulk upload)
│   ├── dashboard/        # Protected user & admin routes
│   ├── go/[productId]/   # Affiliate redirect handler
│   ├── lookbook/[category]/
│   └── product/[id]/
├── components/
├── db/                   # Drizzle schema & client
└── lib/                  # Affiliate utilities
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to Neon |
| `npm run db:studio` | Open Drizzle Studio |
# curated-products
