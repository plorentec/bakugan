# Bakugan

> Web app con Next.js 15, TypeScript y SQLite.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Or build & run with Docker
docker-compose up --build
```

## Tech stack

- [Next.js](https://nextjs.org/) 15 — React framework
- TypeScript 5 — Type safety
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — Fast local SQLite
- [Zod](https://github.com/colinhacks/zod) — Schema validation
- Docker — Containerized deployment
- Caddy — Reverse proxy (optional)