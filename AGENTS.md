# TGT CMS — AI Agent Operational Guidelines

## Overview

This CMS application provides administrative management for The Gold Technologies website (`TGT-LandingPage`).
The website reads all of its content from this CMS, and every change here must keep the two projects in sync.

- **CMS**: `tgt-cms` — Next.js 16, Prisma + PostgreSQL (Supabase), NextAuth v5, Cloudinary (folder `tgt`) for uploads. Local: `http://localhost:3001`
- **Website**: `TGT-LandingPage` — Next.js 14 marketing site. Local: `http://localhost:3000`
- **Seed**: `npm run seed` deletes all data in the database `DATABASE_URL` points to, then re-creates the content from `prisma/seed-data/*.json` and an admin from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Never run it unless the user asks.

## Rules for AI Assistants

1. **Reference Docs First**: Before adding features or making modifications, review `docs/PLAN_AND_STATUS.md` and `docs/ARCHITECTURE.md`.
2. **Keep Status Updated**: When completing a module or file, update the checklist in `docs/PLAN_AND_STATUS.md`.
3. **Preserve Resilient Fallback**: Always maintain zero-downtime static fallbacks in `TGT-LandingPage/src/lib/content.ts` (with the default copy in `TGT-LandingPage/src/content/`) so the live TGT website never breaks if the CMS is offline.
4. **Sharp Image Optimization**: Never upload uncompressed image buffers directly to Cloudinary. Always process through `sharp` (WebP conversion + max 2000px downscale); every upload goes through `src/lib/compressUpload.ts` via `/api/upload`.
5. **Component Parity**: Any changes to frontend sections in `TGT-LandingPage` must be mirrored in `src/app/static-pages/` editors in `tgt-cms`, with the CMS section `type` matching the website section name 1-to-1 (e.g. `GrowthHero`, `ServicePillars`, `Testimonials`).
6. **Empty Value Fallbacks**: Always provide an empty value (`""`, `[]`, or `{}`) at logical OR (`||` / `??`) fallback options (e.g. `initialData?.field || ""` or `?? ""`) and include empty `<option value="">` in select elements.
