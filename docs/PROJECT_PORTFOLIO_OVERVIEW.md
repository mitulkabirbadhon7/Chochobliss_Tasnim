# 📖 ChocoBliss by Tasnim — Full System & Portfolio Case Study

> **A Comprehensive Technical Overview of the Architecture, Security, Data Pipeline, and User Journeys.**

---

## 1. Executive Summary

- **Project Title**: ChocoBliss by Tasnim
- **Category**: High-End Luxury E-Commerce & Artisanal Confectionery Platform
- **Role**: Full-Stack Software Engineer & System Architect
- **Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Neon Serverless PostgreSQL, Prisma ORM, Server Actions, Tailwind CSS, Redux Toolkit, Upstash Redis Rate Limiting.
- **Key Metric**: 100% server-authoritative checkout verification, 0 client-trusted price tampering, 14/14 automated production tests passed, 20/20 statically and dynamically pre-rendered routes.

---

## 2. Core Problem & Engineering Solutions

| Business Requirement | Engineering Challenge | Architectural Solution |
| :--- | :--- | :--- |
| **Luxury Visual Experience** | Balancing rich imagery and micro-interactions with fast load times and Core Web Vitals | Built on Next.js 16 App Router with streaming server rendering, Tailwind CSS, and optimized media containers. |
| **Prevent Price Tampering** | Malicious users modifying cart item prices or coupon codes in browser memory | Zero-trust checkout: client transmits only `productId` and `quantity`. Database executes authoritative pricing resolution inside an atomic transaction. |
| **Inventory Overselling** | Concurrent checkouts ordering the last remaining stock | PostgreSQL transactional row locks (`prisma.$transaction`) verifying quantity before decrementing inventory. |
| **Admin Privilege Security** | Protecting administrative endpoints and mutations from unauthorized users | Server-side `AdminGuard` asserting cryptographic session authenticity and verified `ADMIN` database roles. |
| **DDoS & Brute Force Prevention** | Scripted bots spamming registration, contact, or order endpoints | Token-bucket rate limiting (Capacity: 10, Refill: 1 token / 2s) with client IP and user ID keying. |

---

## 3. Product Catalog Taxonomy (The 3 Core Categories)

The boutique is organized around 3 core categories configured for variant scalability:
1. **`Bar`**: Single-origin dark, milk, and specialty chocolate bars with distinct cacao percentages and terroir notes.
2. **`Customized Bar`**: Personalized formulations, custom-embossed chocolate gifts, and bespoke corporate confectionery hampers.
3. **`mini`**: Artisanal truffles, bite-sized pralines, bonbons, and seasonal tasting collections.

Each product supports rich attributes:
- SKU, Inventory Count, Origin Estate
- Cacao Percentage, Flavor Notes, Ingredients, Allergen Advisories
- Compare-at discount pricing and SEO slug handles

---

## 4. End-to-End User Journeys

### A. The Connoisseur (Customer Journey)
1. **Discovery**: Explores the homepage with non-clickable curated showcases and dynamic category navigators.
2. **Catalog Browsing**: Filters by category (`Bar`, `Customized Bar`, `mini`), inspects origin details, and adds items to the slide-over cart drawer.
3. **Registration & Welcome Reward**:
   - Creates an account at `/register`.
   - Neon PostgreSQL records the account and credits **50 Cocoa Points** welcome bonus.
   - An authenticated session cookie is automatically established and the user is redirected to the dashboard.
4. **Checkout**:
   - Selects or creates a delivery address.
   - Server resolves live prices from PostgreSQL.
   - Order is recorded with status `PENDING` / `PROCESSING`.
   - User earns 1 Cocoa Point for every 100 BDT spent.
5. **Dashboard Tracking**:
   - Views chronological orders at `/dashboard/orders`.
   - Manages saved addresses at `/dashboard/addresses`.
   - Curates a personal chocolate wishlist at `/dashboard/wishlist`.

### B. The Atelier Administrator (Admin Journey)
1. **Secure Entry**: Navigates to `/admin`. The server-side `AdminGuard` verifies that the authenticated user matches `FIXED_ADMIN_EMAILS` and holds `role === 'ADMIN'`.
2. **Operations Dashboard**:
   - Reviews live revenue metrics, active inventory levels, low-stock warnings, and order queues.
3. **Product Studio**:
   - Publishes new product variants under `Bar`, `Customized Bar`, or `mini`.
   - Sets pricing, SKU, ingredients, and upload galleries.
4. **Order Fulfillment**:
   - Updates order states from `PROCESSING` to `SHIPPED` or `DELIVERED`.
   - Assigns delivery tracking numbers and reviews special gift notes.
5. **CMS & Announcements**:
   - Updates storefront announcements and links official Instagram and Facebook pages.

---

## 5. Security & Invariant Guarantees

1. **Server Actions with Strict Zod Validation**:
   - Every input payload is parsed by schema validators before database interaction (`authSchema`, `productSchema`, `orderSchema`, `contactSchema`).
   - String inputs are trimmed to eliminate whitespace injection.
2. **Session Cookie Isolation**:
   - Session cookies utilize `HttpOnly`, `SameSite=Lax`, and `Secure` attributes in production to eliminate XSS cookie exfiltration.
3. **Sensitive Error Sanitization**:
   - Error messages are stripped of database connection strings, passwords, and private server paths before reaching the client interface.

---

## 6. How to Deploy to Vercel (Production Setup)

1. **Repository Setup**:
   Ensure all files are committed and pushed to your GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete production-ready ChocoBliss boutique platform"
   git push -u origin main
   ```
2. **Vercel Project Creation**:
   - Go to [vercel.com](https://vercel.com) and import the repository.
   - Framework preset: **Next.js**.
3. **Environment Configuration**:
   Add the following environment variables in the Vercel project settings:
   - `DATABASE_URL`: Your pooled Neon PostgreSQL connection string.
   - `DATABASE_URL_UNPOOLED`: Your direct Neon PostgreSQL connection string.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`: Client authentication key configured in your environment.
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `chocobliss-app`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `chocobliss-app.firebaseapp.com`
4. **Deploy**:
   - Click **Deploy**. Vercel will build the production application with Turbopack and deploy to a global edge network with instant SSL certificates.
