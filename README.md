# 🍫 ChocoBliss by Tasnim — Luxury Artisanal Confectionery E-Commerce Platform

> **Production-Grade, Full-Stack Next.js 16 Web Application**  
> Built with Next.js 16 (App Router), React 19, Neon Serverless PostgreSQL, Prisma ORM, Server Actions, and Tailwind CSS. Designed with luxury boutique aesthetics, zero-trust server-side security, atomic checkout invariants, and full administrative operations.

---

## 🌟 Executive Project Overview (Portfolio Showcase)

**ChocoBliss by Tasnim** is an enterprise-caliber digital boutique for high-end artisanal chocolates and bespoke confectionery based in Dhaka, Bangladesh. The system merges editorial haute-confectionery visual design with rigorous transactional integrity, zero-trust server-side authorization, and an administrative control studio.

### Key Architectural Highlights
- **Framework**: Next.js 16.3.7 (App Router with Server Actions & Turbopack)
- **Frontend Engine**: React 19, Redux Toolkit (Client Cart & Wishlist), Tailwind CSS, Lucide Icons
- **Database & Storage**: Neon Serverless PostgreSQL (Pooled + Direct connections with AWS ap-southeast-1 deployment)
- **Data Modeling & ORM**: Prisma ORM with `@prisma/adapter-pg` connection pooler
- **Security & RBAC**: Authoritative `AdminGuard` session validation, Token-Bucket Rate Limiter (Capacity: 10, Refill: 1 token / 2s), cross-user ID isolation, sensitive credential redaction
- **Business Logic**: Server-authoritative checkout pricing, atomic inventory decrements, and Cocoa Points loyalty ledger

---

## 📐 Core Architecture & Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 16 APP ROUTER                           │
│                                                                        │
│  Storefront Routes             Client Dashboard        Admin Operations│
│  - / (Hero & Showcase)         - /dashboard            - /admin        │
│  - /shop & /shop/[slug]        - /dashboard/orders     - /admin/orders │
│  - /cart & /checkout           - /dashboard/addresses  - /admin/products│
│  - /story & /contact           - /dashboard/wishlist   - /admin/cms    │
│  - /login & /register          - /dashboard/points     - /admin/cust...│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     CLIENT STATE & UI         │               │     SERVER ACTIONS & RBAC     │
│ - Redux Toolkit Cart State    │               │ - AdminGuard (role === ADMIN) │
│ - Micro-interactions & Canvas │               │ - Token-Bucket Rate Limiter   │
│ - Responsive Mobile Drawers   │               │ - Server-Side Zod Validation  │
└───────────────────────────────┘               └───────────────┬───────────────┘
                                                                │
                                                                ▼
                                                ┌───────────────────────────────┐
                                                │      PRISMA ORM & NEON PG     │
                                                │ - Users, Addresses, Products  │
                                                │ - Orders & OrderItems         │
                                                │ - Wishlist, Reviews, CMS      │
                                                └───────────────────────────────┘
```

---

## 🚀 Key Functional Modules

### 1. Storefront & Product Catalogue
- **3 Core Categories**:
  1. `Bar` — Single-origin artisanal chocolate tablets.
  2. `Customized Bar` — Bespoke luxury formulations and personalized gift selections.
  3. `mini` — Bite-sized truffles, pralines, and tastings.
- **Rich Product Metadata**: Cacao percentages, origin estates, flavor notes, ingredient formulations, allergen notices, SKU inventory tracking, and gallery displays.
- **Editorial Homepage**: Luxury non-clickable showcase gallery, interactive category navigator, artisan craftsmanship storytelling, and seasonal announcement ticker.

### 2. Cart, Checkout & Pricing Authority
- **Zero Client Trust**: Product prices and discounts submitted by the browser are discarded. Unit prices are retrieved authoritatively from PostgreSQL within database transactions.
- **Atomic Transactions**: Orders cannot oversell stock. Available quantities are validated and decremented atomically in Prisma.
- **Cocoa Points Engine**: Earn 1 point per 100 BDT spent, automatically credited upon order confirmation.

### 3. Customer Account Portal (`/dashboard`)
- **Live Order Tracking**: Chronological order history with real-time status badges (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **Delivery Address Manager**: Multi-address management with default billing/shipping selections.
- **Curated Wishlist**: Instant toggle with optimistic client updates and persistent PostgreSQL storage.
- **Cocoa Points Ledger**: Live balance visualization with tier progression badges.

### 4. Administrative Control Studio (`/admin`)
- **Executive KPI Dashboard**: Live tracking of Gross Revenue (BDT), Order Volume, Active Inventory Alerts, and Customer Counts.
- **Product Management Studio**: Create, edit, and soft-delete products with instant category mapping, pricing, variant descriptions, and image uploads.
- **Order Management Terminal**: Instant status updates (`PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`), delivery tracking assignment, and gift note review.
- **Storefront CMS & Announcements**: Manage announcement banners, studio locations, and official Instagram/Facebook handles without writing code.

---

## 🔒 Security Architecture & Admin Protection

### How Admin Access is Enforced
Admin security is server-authoritative and does not rely on client-side state:
1. **Designated Admin Registry** ([`src/lib/constants/admins.ts`](file:///d:/Development/New%20folder/ChochoBliss_Tasnim/CB/src/lib/constants/admins.ts)):
   - Configured with official administrator email addresses:
     ```ts
     export const FIXED_ADMIN_EMAILS = [
       "mitulkabirbadhon7@gmail.com",
       "ttasnim342@gmail.com",
     ];
     ```
2. **Server-Side AdminGuard** ([`src/lib/auth/admin-guard.ts`](file:///d:/Development/New%20folder/ChochoBliss_Tasnim/CB/src/lib/auth/admin-guard.ts)):
   - Verifies the cryptographic session cookie (`__session`).
   - Resolves the user from the database.
   - Strictly asserts `user.role === "ADMIN"`. If an unauthorized customer or guest attempts to invoke any admin Server Action or access `/admin`, the request is terminated with `401 Unauthorized` or `403 Forbidden`.
3. **Identity Spoofing Prevention**:
   - Client modifications to local storage, cookies, or Redux state cannot elevate permissions because role assertions are executed purely in server-side runtime code.

---

## 🛠️ Step-by-Step: Managing Admin Access & Database Records

### Step 1: Updating Administrator Emails
To add or modify authorized administrators:
1. Open [`src/lib/constants/admins.ts`](file:///d:/Development/New%20folder/ChochoBliss_Tasnim/CB/src/lib/constants/admins.ts).
2. Update the email list in `FIXED_ADMIN_EMAILS`.
3. In your database (or via Prisma Studio), set the user's `role` column to `ADMIN`.

### Step 2: Accessing and Editing the Database
You can view and modify any database record (Users, Products, Orders, CMS) using either method:

#### Option A: Prisma Studio (Visual Web GUI)
Run the built-in Prisma visual studio locally:
```bash
npx prisma studio
```
- Open `http://localhost:5555` in your browser.
- Browse and edit `products`, `users`, `orders`, `site_contents`, etc. directly with a clean spreadsheet interface.

#### Option B: Neon PostgreSQL Cloud Console
1. Log in to [Neon Console](https://console.neon.tech).
2. Select the `ep-sparkling-mouse-b37vp389` project.
3. Open the **SQL Editor** tab to execute queries or view live tables.

---

## 🧪 Comprehensive Automated Test Suite

Run the full end-to-end test suite:
```bash
# Run the complete test suite (Auth, Orders, Security, Permissions, Storefront, CMS)
npm run test

# Run individual test modules
npm run test:auth     # Security & Role Guards
npm run test:phase5d  # Admin Action Verifications
npm run test:full     # Full Production Integration Suite
```

---

## 🌐 Step-by-Step: Deploying to Vercel (Free & Production-Ready)

Vercel is the native hosting platform for Next.js and offers a 100% free Tier for production applications.

### 1. Push Your Code to GitHub
Follow the Git steps below to ensure your repository is clean:
```bash
git add .
git commit -m "feat: complete production-ready ChocoBliss platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chochobliss-app.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** ➔ **Project**.
3. Select your `chochobliss-app` repository and click **Import**.
4. Set **Root Directory** to `.` (or `CB` if you keep the subfolder structure).
5. In **Environment Variables**, add the variables from `.env.local`:
   - `DATABASE_URL` = `postgresql://neondb_owner:...@ep-sparkling-mouse...aws.neon.tech/neondb?channel_binding=require&sslmode=require`
   - `DATABASE_URL_UNPOOLED` = `postgresql://neondb_owner:...@ep-sparkling-mouse...aws.neon.tech/neondb?channel_binding=require&sslmode=require`
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = `AIzaSyEnvironmentConfiguredKeyForClientAuth`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `chocobliss-app`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `chocobliss-app.firebaseapp.com`
6. Click **Deploy**.
7. Vercel will compile, run Turbopack page generation, and launch your live production website in ~60 seconds!

---

## 🧑‍💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Synchronize Prisma Client
npx prisma generate

# 3. Start Frontend and Backend Development Servers
npm run dev
# Or run both simultaneously:
npm run dev:all
```

- **Storefront**: `http://localhost:3000`
- **Admin Control Panel**: `http://localhost:3000/admin`
- **Backend API**: `http://localhost:5000`
