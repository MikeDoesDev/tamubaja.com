# tamubaja.com

Sponsor website for Texas A&M Baja SAE. Next.js + Tailwind, hosted on Vercel.

- **Editing content (no coding):** see [EDITING.md](EDITING.md)
- **Accounts and ownership:** see [HANDOFF.md](HANDOFF.md)
- **Design spec:** `docs/superpowers/specs/2026-10-05-tamu-baja-sponsor-site-design.md`

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Check

```bash
npm run validate     # content files + referenced images/PDFs
npm test             # unit tests
npm run test:e2e     # browser tests (builds and starts the site)
npm run lighthouse   # needs `npm run start` running in another terminal
```

## Deploy

Every push to `main` deploys automatically on Vercel. A failed build never replaces the live site.
