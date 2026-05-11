# v0-school-planning-platform-redesign

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_gzxhkjFOQFrl6iFsodLMDG70HAop)

## Getting Started

School data lives in `lib/schools-bundled.json` (from the `p1-school-selector` build pipeline). Home search and “use my location” call **`GOOGLE_MAPS_SERVER_API_KEY`** on the server (routes `/api/onemap/search` and `/api/onemap/reverse` proxy [Google Geocoding](https://developers.google.com/maps/documentation/geocoding/overview)). Enable the **Geocoding API** for that key and restrict the key appropriately (HTTP referrers for browser keys are not used here—prefer a server key with IP restrictions on Vercel). **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** is optional until a client-side map or Places widget is wired up.

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
