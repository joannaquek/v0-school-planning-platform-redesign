# v0-school-planning-platform-redesign

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_gzxhkjFOQFrl6iFsodLMDG70HAop)

## Official school data

School profiles, CCAs, programmes, and coordinates come from `lib/schools-bundled.json`, the same bundle built by the `p1-school-selector` app (data.gov.sg MOE datasets + compiled ballot snapshots).

After refreshing data in a local `p1-school-selector` checkout (sibling folder next to this project), copy the new bundle in:

```bash
# In p1-school-selector: npm run data:download && npm run data:build && npm run data:geocode
npm run sync-school-data
npm run build
```

Or copy `p1-school-selector/lib/schools-bundled.json` to `lib/schools-bundled.json` manually.

Commit the updated `lib/schools-bundled.json` so Vercel (and other hosts) serve the new snapshot.

## Deploy to Vercel

1. Push this repo to GitHub (if it is not already).
2. In [Vercel](https://vercel.com), **Add New Project** and import the repository.
3. Framework preset: **Next.js**; root directory: this repo root (`v0-school-planning-platform-redesign` if the repo contains only this app).
4. Deploy. No extra environment variables are required for the static bundled data.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/joannaquek/v0-school-planning-platform-redesign" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
