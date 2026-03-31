<div align="center">
  <img src="https://thegoldtechnologies.com/images/logo.png" alt="TGT Logo" width="200" style="margin-bottom: 20px;" />

  # **TGT CMS (The Gold Technologies Content Management System)**
  
  <p>
    <b>A high-performance, custom-built, premium Content Management Dashboard</b><br>
    <i>Next.js 14 • Prisma • PostgreSQL • Tailwind CSS • Framer Motion</i>
  </p>

  ---

  [![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-blue.svg)]()
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38B2AC.svg)]()
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-5A67D8.svg)]()

</div>

<br />

Welcome to **TGT CMS** — a dedicated platform built from the ground up to securely and dynamically map out The Gold Technologies' digital footprint. This centralized portal offers a seamless, fast, and highly customizable UI for managing digital marketing services, deep portfolio integrations, modern blogging, and direct client leads without ever having to touch code.

---

## 📑 Table of Contents

- [Core Principles & Features](#-core-principles--features)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [Developer Setup](#-developer-setup)
- [Design Language](#-design-language)
- [Component Development](#-component-development)

---

## ✨ Core Principles & Features

TGT CMS bridges the gap between static site generation and dynamic database-driven views by exposing real-time API integrations that are tightly cached.

| Feature Area | Capabilities |
| :--- | :--- |
| **Modular Page Control** | Section-based layout mapping for rapid edits to Home, About, Services, and Product views. |
| **Dynamic Portfolio Engine** | Structured tracking for deliverables (e.g., challenges, solutions, scope, outcomes). |
| **Blogging Identity** | SEO-ready authoring tools with custom layouts, pull-quotes, and rich image uploads. |
| **Enquiry & Lead CRM** | Unified dashboard tracing direct form submissions, analytics, and CRM integration. |
| **Performance Matrix** | Advanced `fetchWithCache` middleware preventing unneeded database queries while sustaining real-time previews. |

---

## 🚀 System Architecture

Built relentlessly for Speed, Security, and Scale.

*   **Frontend**: `Next.js 14 (App Router)` running `React 18` under the hood.
*   **Database Engine**: `PostgreSQL` managed strictly via `Prisma ORM` schema migrations.
*   **Styling Structure**: `Tailwind CSS`, paired dynamically with `Framer Motion` and `Lucide React` icons.
*   **State Control**: Modular React Hooks, integrated `react-hook-form` validation, and real-time state alerts via `react-toastify`.

---

## 📂 Folder Structure

The repository is modularly segmented. Keeping UI components apart from specific dashboard layouts allows for high reusability.

```text
client/
├── prisma/                    # Schema models, seeds, and database configs
├── public/                    # Root static assets, fonts, and local images
├── src/
│   ├── app/                   # Root directory for Next.js 14 App Router
│   │   ├── api/               # Server-side logic (GET, POST, PUT, DELETE)
│   │   ├── components/        # Universal components (Sidebar, TopNav)
│   │   └── static-pages/      # The heartbeat of the CMS 
│   │       ├── home/          # Homepage Sections UI
│   │       ├── about/         # About TGT Modules
│   │       ├── portfolio/     # Case Studies & Work Profiles
│   │       └── products/      # Products & Specialized Packages
│   ├── components/            # Reusable core elements (Inputs, Uploaders, Modals)
│   └── lib/                   # Integrations (API handlers, Prisma instance)
├── .env                       # Local secrets (Database URLs, API Keys)
├── next.config.mjs            # Application compilation configuration
├── tailwind.config.ts         # Unified design tokens and strict styling rules
└── README.md                  # Project documentation (You are here!)
```

---

## 💻 Developer Setup

Follow the steps below to initialize and serve the CMS locally on your machine.

### 1. Requirements

Ensure the target machine has the following dependencies initialized in the global environment:
*   [Node.js](https://nodejs.org/) (v18.0.0 or later)
*   [npm](https://docs.npmjs.com/) (v9.0.0 or later)
*   [PostgreSQL](https://www.postgresql.org/download/)

### 2. Install Dependencies

Clone this monorepo locally, navigate strictly into the `client` directory, and hydrate the application:

```bash
git clone <repository-url>
cd TGT-cms/client
npm install
```

### 3. Environment Allocation

Generate a secure `.env` file at the root of `client/` containing your connection parameters. 

```env
# Primary PostgreSQL URI
DATABASE_URL="postgresql://username:password@localhost:5432/tgt_database?schema=public"

# File Storage Configuration (If executing external S3/Supabase bindings)
NEXT_PUBLIC_STORAGE_URL="https://your-object-storage-endpoint"
```

### 4. Database Syncing

With the credentials applied, inform Prisma to construct the required tables automatically, and seed any starting parameters.

```bash
# Push schema structure into the database
npx prisma db push

# Create local Prisma client TS definitions
npx prisma generate
```

*(If you require sample data, you can build custom scripts and fire them utilizing `npx tsx your-script.ts`)*

### 5. Initialization

To boot the instance up safely locally across your network:

```bash
npm run dev
```

Your system is now successfully running at `http://localhost:3000`.

---

## 🎨 Design Language

Do not stray wildly from the core principles of TGT. The application relies entirely on maintaining a high-fidelity "premium agency" visual aesthetic:

*   **Deep Dark Core (`#0A0F29`)**: Utilize heavily shaded blues and blacks to simulate high digital depth.
*   **The Gold Accent (`#D4AF37`)**: Explicitly to be utilized for primary CTAs, highlight trims, borders, and hovering animations. Overusing gold neutralizes the premium tone.
*   **The Glassmorphism Matrix**: For modals and overlapping cards, ensure you leverage the `backdrop-blur` utility backed securely by translucent dark layers (`bg-black/50`).
*   **Fluid Motion**: Framer motion triggers should feel native—no aggressive pacing. Fast fading logic with low spring bounces.

---

## ⚡ Component Development

### Standard Operating Procedure (SOP)
When patching or developing brand-new endpoints:
1.  **API Integration**: The platform handles rigorous `GET` requests using the internal `lib/apiCache.ts`.
2.  **Stale Invalidation**: **CRITICAL** - Whenever constructing `POST`, `PUT`, or `DELETE` directives within the interface, you **MUST** formally evict the cache directly using `apiCache.clear('/api/targeted-route')`. Failing to do so forces users to hard-reload natively.
3.  **Client/Server Separation**: Strict adherence to inserting `"use client"` inside interactive React models to prevent SSR compilation errors spanning the `app/` directory.

---

<p align="center">
  <b>© 2026 The Gold Technologies</b><br>
  Strictly Private and Confidential Codebase.
</p>
