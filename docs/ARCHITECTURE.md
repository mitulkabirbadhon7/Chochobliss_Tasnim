# Chocobliss by Tasnim — Technical Architecture

This document outlines the architectural blueprint for Chocobliss by Tasnim, detailing component hierarchy, data flow, security boundaries, and infrastructure integration.

---

## 1. System Overview

Chocobliss by Tasnim is an artisanal chocolate e-commerce platform built with Next.js App Router, Tailwind CSS, Prisma ORM, and Neon Serverless PostgreSQL.

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (Browser)                      │
│   • Storefront (Home, Shop, Story, Announcements)           │
│   • Customer Dashboard (/dashboard)                         │
│   • Admin CMS Panel (/admin)                                │
│   • Canvas Animation (HeroCanvas via requestAnimationFrame)  │
│   • Client State (Redux Toolkit for Cart & Session)         │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / Server Actions
┌──────────────────────────────▼──────────────────────────────┐
│             Next.js 14+ Server Application Layer             │
│   • Proxy / Route Guards (RBAC, Session Auth, Security Headers) │
│   • Server Actions & Route Handlers (with Zod validation)   │
│   • Rate Limiting (Token Bucket: 10 capacity, 2s refill)   │
│   • Caching Layer (revalidatePath, revalidateTag)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Pooled PgBouncer (TLS/SSL)
┌──────────────────────────────▼──────────────────────────────┐
│              Data Layer (Neon Serverless Postgres)          │
│   • Prisma ORM Client (Parameterized queries, transactions)  │
│   • Branching Architecture (production, staging, dev)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Architecture

The application adheres to clean separation of concerns inside `src/`:

```
src/
├── app/                  # Next.js App Router pages, layouts, and route handlers
│   ├── (auth)/           # Authentication route group (login, register)
│   ├── (shop)/           # Public storefront routes (shop, cart, checkout, story)
│   ├── admin/            # Admin panel (products, orders, customers, cms)
│   ├── api/              # API endpoints (health checks, webhooks)
│   └── dashboard/        # Customer account area (orders, points, wishlist)
├── components/           # Reusable UI components
│   ├── admin/            # Data tables, sidebar, metric cards
│   ├── canvas/           # HeroCanvas scroll-driven canvas renderer
│   ├── cart/             # Cart drawer, checkout summary
│   ├── dashboard/        # Order history cards, loyalty badges
│   ├── shared/           # Header, Navbar, Footer, Logo
│   ├── shop/             # Product cards, gallery, filter sidebar
│   └── ui/               # Base primitives (buttons, inputs, dialogs)
├── lib/                  # Server-side business logic and utilities
│   ├── actions/          # Next.js Server Actions (mutations with auth checks)
│   ├── prisma.ts         # PrismaClient singleton with connection pooling
│   ├── rate-limit.ts     # Token-bucket rate limiter
│   ├── utils.ts          # Class merging and formatting helpers
│   └── validations/      # Zod validation schemas
├── store/                # Client state management
│   ├── hooks.ts          # Typed Redux hooks
│   ├── index.ts          # Redux Toolkit store definition
│   ├── provider.tsx      # Client-side StoreProvider component
│   └── slices/           # State slices (cart, session, ui)
└── types/                # Domain TypeScript interfaces and types
```

---

## 3. Security Boundaries & Execution Pipeline

Every state mutation follows a strict sequence:

1. **Authentication:** Verify active session and extract authenticated user identity.
2. **Authorization (RBAC):** Verify role permissions (`ADMIN` required for `/admin` routes and mutations).
3. **Rate Limiting:** Enforce token-bucket check per IP / user token to stop automated abuse.
4. **Input Validation:** Parse all incoming arguments using Zod schemas on the server.
5. **Business Logic Execution:** Perform required domain operations inside Prisma transactions where atomicity is required.
6. **Cache Invalidation:** Call `revalidateTag` or `revalidatePath` to purge stale read-cache data.
7. **Safe Response:** Return structured `ActionResult<T>` concealing internal database details and error stack traces.

---

## 4. State Management Strategy

* **Server State:** Handled natively by Next.js Server Components and Server Actions. Cached reads and tag-based invalidations eliminate the need for global client stores for products and orders.
* **Client State (Redux Toolkit):**
  * `cartSlice`: Manages active cart items, quantities, and client-side persistence (localStorage sync).
  * `uiSlice`: Manages modal states, mobile drawer toggles, and search filters.
* **Session State:** Cached server session with read-only client hydration.

---

## 5. Performance & Asset Delivery

* **Scroll Canvas Animation:** Utilizes `requestAnimationFrame` and preloaded HTML5 `<canvas>` rendering mapped linearly to viewport scroll percentage. Falls back to static photography when `prefers-reduced-motion` is active.
* **Database Optimization:** Pooled connections via PgBouncer on Neon PostgreSQL prevent serverless connection exhaustion. Direct unpooled connections are isolated to Prisma migrations.
