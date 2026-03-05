# TGT CMS: The Gold Technologies Content Management System

TGT CMS is a modern, high-performance Content Management System (CMS) designed specifically for The Gold Technologies agency. It provides a robust and flexible interface for managing static pages, service highlights, portfolios, blogs, and lead enquiries.

## 🚀 Key Features

- **Section-Based Page Builder**: Highly modular structure allowing for easy management of home, about, services, and product pages.
- **Dynamic Portfolios & Services**: Reusable components for managing project galleries and service offerings.
- **Advanced Blog Engine**: Full-featured blog management with support for custom layouts, pull quotes, and takeaways.
- **Unified Lead Management**: Automated capturing and tracking of client enquiries through a central dashboard.
- **Real-time Previews & Caching**: Optimized performance via a dedicated API caching layer (`fetchWithCache`).
- **Premium Design System**: A sleek, dark-themed UI featuring gold accents, glassmorphism, and responsive micro-animations.

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks with custom API caching.

## 📁 Project Structure (CMS Client)

```
client/
├── prisma/               # Database schema and migrations
├── src/
│   ├── app/
│   │   ├── api/          # Serverless API routes (About, Home, Products, etc.)
│   │   ├── static-pages/ # CMS Dashboard pages and sub-modules
│   │   └── lib/          # Database clients and upload helpers
│   ├── components/       # Reusable UI components (InputField, SaveButton, etc.)
│   └── lib/              # Core utility functions (API Cache)
└── public/               # Static assets and uploads
```

## ⚙️ Getting Started

### Prerequisites

- **Node.js**: v18 or later
- **PostgreSQL**: A running instance of PostgreSQL.

### Installation

1.  **Clone the repository**:

    ```bash
    git clone [repository-url]
    cd TGT-cms/client
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the `client/` directory and configure your database host:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/tgt_cms"
    ```

4.  **Database Migration**:
    Push the Prisma schema to your local database:

    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to access the CMS dashboard.

## 🎨 Design Guidelines

The CMS uses a premium aesthetic:

- **Primary Color**: Dark Blue (`#0B0F29`)
- **Accent Color**: Gold (`#D4AF37`)
- **Interactive Elements**: All primary buttons follow a unified theme with gold glowing borders and smooth hover transitions.

## 📄 License

Private and confidential for The Gold Technologies.
