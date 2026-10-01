# Chocobliss by Tasnim — Technical Requirements Document (TRD)

This document establishes the functional requirements, API contracts, security criteria, and operational constraints for the Chocobliss platform.

---

## 1. Functional Scope

### 1.1 Storefront & Catalog
* Public browsing of product categories, descriptions, ingredients, allergens, and origin details.
* Dynamic search and category filtering without full page reloads.
* Product detail page with dynamic slug routing (`/shop/[slug]`).
* Hero canvas scroll animation mapping user scroll depth to animation frames (`/public/frames/`).

### 1.2 Cart & Checkout
* Client-side cart persistence with Redux Toolkit and localStorage fallback.
* Guest browsing permitted; customer checkout requires authentication.
* Support for delivery notes and personalized gift notes (Persona A: Amira).
* Point redemption and point accumulation calculations at checkout.

### 1.3 User Dashboard
* Real-time order history tracking with status badges (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
* Saved shipping destinations management.
* Wishlist toggle and instant item addition.
* Cocoa Points balance display and redemption history.

### 1.4 Admin Panel (Tasnim)
* Server-side route protection restricting `/admin` to users with `role === 'ADMIN'`.
* Product inventory management: Create, update, soft delete, and stock count tracking.
* Order pipeline management: Status transitions, tracking number assignment, order inspection.
* Customer directory: View customer profiles, order counts, and loyalty points.
* Content Management: Announcement banner scheduling (start/end dates) and homepage editorial updates.

---

## 2. Non-Functional Requirements

* **Performance:** First Contentful Paint (FCP) `< 1.2s`, Largest Contentful Paint (LCP) `< 2.5s` on desktop.
* **Network Resilience:** Graceful degradation on throttled connections (simulated slow 3G). Images and heavy interactive canvas must load progressively.
* **Security & Compliance:**
  * Zero exposure of database credentials or server secrets in client bundles.
  * Server-side Zod validation on every mutation.
  * Token-bucket rate limiting (Capacity: 10, Refill: 1 token every 2 seconds) on sensitive endpoints.
  * Generic error messages on authentication failures.
