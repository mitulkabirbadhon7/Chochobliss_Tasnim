# Chocobliss by Tasnim — Agent Engineering Rules

These rules govern all engineering, development, and architectural tasks for the Chocobliss by Tasnim codebase.

---

## 1. Absolute Directives

1. **No Hallucination:** Never assume the existence of packages, database models, environment variables, or endpoints that are not explicitly documented.
2. **Server-Side Validation:** All user inputs must be strictly validated with Zod on the server. Client-side validation is strictly for user experience, not security.
3. **RBAC & Authorization:** Admin access (`/admin`) and admin actions must be verified server-side. Never trust roles or permission claims submitted from client payloads.
4. **Secret Protection:** Never commit `.env` or `.env.local` files. Never expose database credentials, service-role keys, or private tokens to the client. Keep public client variables prefixed strictly with `NEXT_PUBLIC_`.
5. **Generic Error Responses:** Never reveal database error messages, stack traces, or account enumeration clues (e.g., use "Invalid email or password").
6. **No AI Aesthetic:** Avoid generic AI-generated templates, excessive glassmorphism, random purple gradients, or unmotivated animations. Follow the provided design mockups and editorial guidelines.

---

## 2. Code Quality & Standards (Section 38 Compliance)

* **SOLID & Clean Architecture:** Modules must maintain single responsibilities. Separate presentation, business logic, and database access.
* **Pragmatic OOP:** Use classes where encapsulation and statefulness deliver concrete benefits (e.g., `RateLimiter`, service repositories, payment processors). Use idiomatic functional code for React components and Server Actions.
* **Naming Conventions:** Descriptive, intention-revealing names. Single-letter identifiers are prohibited. Booleans must use `is`, `has`, or `can` prefixes.
* **Strict TypeScript:** No `any`. No `@ts-ignore` or `@ts-nocheck` workarounds. All public functions and Server Actions must type their inputs and outputs.
* **Standard Response Shape:** All Server Actions must return a consistent `ActionResult<T>` structure:
  ```typescript
  type ActionResult<T> =
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } };
  ```

---

## 3. Database & ORM Rules

* Always access Neon PostgreSQL via the Prisma singleton in `src/lib/prisma.ts`.
* Parameterized queries only; `$queryRawUnsafe` is prohibited.
* Wrap multi-entity updates (e.g., checkout order creation, inventory decrements, points balance updates) in `prisma.$transaction`.
* Use soft deletes (`deletedAt`) on products to preserve historical order records.
