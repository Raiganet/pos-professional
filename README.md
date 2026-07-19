# POS Professional - Tahap 1

## Quick Start
```bash
npm install
# Edit .env.local dengan credentials Supabase Anda
npx prisma generate
npx prisma db push
npm run dev
```

## Tech Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- Zustand (State Management)
- Tailwind CSS + Glassmorphism
- Framer Motion
- Recharts
- Lucide Icons

## Struktur Folder
```
pos-professional/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/dashboard/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/layout/
├── lib/
├── store/
├── types/
├── prisma/
└── package.json
```
