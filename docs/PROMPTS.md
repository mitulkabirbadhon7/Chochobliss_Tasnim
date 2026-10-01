# Antigravity Project Implementation Prompt

## 0. PROJECT EXECUTION RULES

You are working as a senior production-level Full-Stack Engineer, Security Engineer, UI/UX Engineer, and QA Engineer.

The goal is to build this project as a **real production website**, not as an AI-generated demo, template, or generic SaaS dashboard.

The implementation must prioritize:

* Security
* Maintainability
* Performance
* Realistic UI/UX
* Accessibility
* Mobile responsiveness
* Server-side validation
* Secure authentication
* Secure authorization
* Database security
* Rate limiting
* Caching
* Progressive/lazy loading
* Clean architecture
* Production deployment readiness

---

# 1. PROJECT ROOT

The project repository is:

`mitulkabirbadhon7/Med_Course`

Expected repository structure includes:

```text
apps/
  web/
  api/

packages/
database/
tests/
docs/
```

### IMPORTANT

Do NOT assume that a file, folder, package, API, database table, component, environment variable, or configuration exists.

Before modifying anything:

1. Inspect the repository.
2. Read the relevant existing files.
3. Check the current architecture.
4. Check package.json files.
5. Check existing database configuration.
6. Check existing environment-variable usage.
7. Check existing authentication implementation.
8. Check existing routes.
9. Check existing components.
10. Check existing tests.

If something is missing, do not invent its contents.

If the requirement conflicts with the existing architecture, STOP and report the conflict before making a destructive architectural change.

---

# 2. MANDATORY DOCUMENTATION READING

Before starting ANY phase, read:

```text
docs/PROJECT_OVERVIEW.md
docs/TRD.md
docs/ARCHITECTURE.md
docs/AGENT_RULES.md
```

Also read phase-specific documentation when relevant:

```text
docs/SCHEMA.md
docs/UI_UX.md
docs/UI_UX_DESIGN/
```

If one of these files does not exist:

* Do NOT invent its contents.
* Report that the file is missing.
* Continue only when the missing file is not required to safely implement the phase.

---

# 3. SOURCE-OF-TRUTH RULE

The existing project documentation is the primary source of truth.

Priority order:

1. Existing working code
2. `docs/PROJECT_OVERVIEW.md`
3. `docs/TRD.md`
4. `docs/ARCHITECTURE.md`
5. `docs/SCHEMA.md`
6. `docs/UI_UX.md`
7. `docs/AGENT_RULES.md`
8. Phase-specific requirements in this file

Do not silently replace existing architecture because a different approach seems easier.

If two requirements conflict:

1. Detect the conflict.
2. Explain it.
3. Do not silently choose an architecture.
4. Ask for clarification if the conflict materially affects implementation.

---

# 4. NO-HALLUCINATION RULE

This is mandatory.

Never invent:

* Database fields
* Database relationships
* API endpoints
* Firebase configuration
* Supabase configuration
* Environment variables
* Existing components
* Existing routes
* Existing users
* Existing admin accounts
* Existing credentials
* Existing design specifications
* Existing images
* Existing API responses
* Existing dependencies

Before using something, verify that it exists.

If it does not exist, create it only when the project requirements explicitly require it.

---

# 5. DESIGN REQUIREMENT — DO NOT MAKE THE WEBSITE LOOK AI-GENERATED

The website must NOT look like a generic AI-generated website.

Avoid:

* Generic SaaS dashboards
* Excessive rounded cards
* Random gradients
* Excessive glassmorphism
* Generic purple/blue AI color palettes
* Repetitive cards
* Template-like layouts
* Unnecessary floating elements
* Excessive shadows
* Artificial-looking animations
* Generic hero sections
* Excessive whitespace with no design purpose
* Repeated identical sections
* “AI startup landing page” aesthetics

The UI should feel:

* Designed by a professional human designer
* Brand-specific
* Intentional
* Clean
* Modern
* Editorial where appropriate
* Visually balanced
* Consistent
* Fast
* Accessible
* Realistic

Use the provided UI/UX documentation and design references as the source of truth.

Do NOT redesign the brand without instruction.

If design images exist in:

```text
docs/UI_UX_DESIGN/
```

inspect and follow them.

Design assets should remain organized by screen/feature where applicable.

Runtime assets should be placed in the appropriate application asset directory rather than randomly inside `docs/`.

---

# 6. AUTHENTICATION ARCHITECTURE

The project requirement includes Firebase and Supabase.

### IMPORTANT

Do NOT implement two independent authentication systems.

The authentication responsibility must be clearly defined before implementation.

Unless existing architecture explicitly states otherwise:

### Firebase Authentication

Firebase Authentication should be treated as the authentication/identity provider for:

* Sign up
* Sign in
* Sign out
* Password authentication
* Password reset
* Session/user identity

### Database

The application database remains the database defined by the project architecture.

If the project uses:

```text
Prisma + NeonDB
```

do not replace it with Supabase Database unless the project documentation explicitly requires that change.

### Supabase

Supabase must only be used for the specific service defined by the project's architecture/requirements.

Do NOT add Supabase as a second authentication provider.

If Supabase's exact responsibility is not defined in the project documentation, report this before implementing Phase 2.

---

# 7. PASSWORD SECURITY

Never create or store plaintext passwords.

Do not implement custom password encryption.

When Firebase Authentication is used:

* Password handling must remain inside Firebase Authentication.
* Never store raw passwords in NeonDB.
* Never log passwords.
* Never return passwords through API responses.
* Never expose authentication secrets to the browser.

Use secure password hashing/credential handling provided by the authentication provider.

---

# 8. SECURITY REQUIREMENTS

Security is mandatory throughout the entire project.

## Server-side validation

Every mutation must validate input on the server.

Client-side validation may be used for UX, but it is NOT a security boundary.

Every Server Action/API endpoint must:

1. Authenticate the request when required.
2. Authorize the user.
3. Validate input.
4. Apply rate limiting where appropriate.
5. Perform the database operation.
6. Return only the required data.

---

# 9. ADMIN SECURITY

The admin panel is highly sensitive.

The Admin UI must NEVER be protected only by hiding a link.

Admin authorization must be enforced server-side.

Requirements:

* Only users with the verified `ADMIN` role can access admin functionality.
* Non-admin users must not be able to call admin Server Actions/API endpoints directly.
* Admin routes must be protected.
* Admin mutations must perform server-side authorization.
* Admin data must not be exposed to unauthorized clients.
* Admin-only database operations must verify authorization before execution.
* Never trust a role supplied directly by the client.
* Never allow a client to modify its own role.
* Admin role assignment must be controlled through a trusted server-side mechanism.

The frontend may hide the Admin navigation item, but this is only a UX feature.

It is NOT the security mechanism.

---

# 10. GENERIC AUTHENTICATION ERRORS

Authentication errors must not reveal whether an account exists.

For example, use:

```text
Invalid email or password.
```

instead of:

```text
This email does not exist.
```

Do not expose internal authentication errors, database errors, stack traces, secrets, or implementation details to users.

Detailed errors may be logged securely on the server where appropriate.

---

# 11. RATE LIMITING

Implement a production-safe token-bucket rate limiter.

Use the project's approved Redis/rate-limiting infrastructure.

If Upstash Redis is specified by the architecture, use Upstash Redis.

### Token Bucket Requirements

Each user/IP receives a bucket with:

```text
Maximum capacity: 10 requests
Refill rate: 1 token every 2 seconds
```

Example:

```text
Bucket capacity = 10

10 requests can initially be consumed.

After 2 seconds:
+1 token

After another 2 seconds:
+1 token

Continue until the bucket reaches 10.
```

Do not reset the bucket completely after a fixed period.

It must behave as a real token bucket.

When no token is available:

```text
HTTP 429 Too Many Requests
```

Return an appropriate retry indication where practical.

Apply rate limiting to sensitive operations including authentication and order creation, according to the architecture.

Do not rate-limit only in the browser.

Rate limiting must be enforced server-side.

---

# 12. DATABASE SECURITY

All database access must use the approved ORM/database architecture.

If Prisma + NeonDB is configured:

* Use Prisma.
* Use parameterized queries.
* Do not construct unsafe raw SQL from user input.
* Avoid `$queryRawUnsafe`.
* Validate all user-controlled input before database operations.
* Enforce authorization before database mutations.
* Apply appropriate indexes.
* Use transactions for operations that must be atomic.
* Prevent users from accessing another user's private records.

Implement soft deletion where specified.

For products:

```text
deletedAt
```

should be used for soft deletes if required by the schema.

Do not permanently delete records unless the project explicitly requires it.

---

# 13. ENVIRONMENT VARIABLES AND SECRETS

Never expose secrets to the browser.

Never expose:

```text
DATABASE_URL
SUPABASE_SERVICE_ROLE_KEY
private Firebase credentials
private API keys
Redis credentials
server secrets
```

Use environment variables.

Only variables explicitly intended for browser usage may use the framework's public environment-variable mechanism.

Never commit:

```text
.env
.env.local
.env.production
```

or other secret files.

Verify `.gitignore`.

Before deployment, inspect Git history and repository status for accidentally committed secrets.

---

# 14. API / SERVER ACTION SECURITY

Every Server Action/API endpoint must determine:

```text
Who is the user?
Is authentication required?
Does the user have permission?
Is the input valid?
Is the request rate-limited?
What data may be returned?
```

Never assume that because a button is hidden, an action is secure.

All security decisions must happen on the server.

---

# 15. CACHING

Use caching for read-heavy data where appropriate.

Do not blindly cache everything.

Use Next.js caching mechanisms appropriate to the current Next.js version and project architecture.

For cached data:

* Define appropriate cache duration/revalidation.
* Invalidate/revalidate affected data after mutations.
* Do not cache private user-specific data globally.
* Do not expose one user's cached data to another user.
* Do not cache sensitive admin information incorrectly.

For example:

```text
getProducts()
```

may be cached.

After:

```text
createProduct()
updateProduct()
deleteProduct()
```

the relevant product cache must be invalidated/revalidated.

Avoid duplicate API requests from multiple components.

Prefer server-side data fetching where appropriate instead of unnecessary client-side API calls.

---

# 16. PERFORMANCE AND PROGRESSIVE LOADING

Do not load the entire application unnecessarily at initial page load.

Use:

* Server Components where appropriate
* Dynamic imports for genuinely heavy client components
* Lazy loading
* Intersection Observer where appropriate
* Pagination/infinite scrolling
* Image lazy loading
* Proper responsive image sizes
* Code splitting
* Streaming where appropriate
* Efficient data fetching

Important:

Do NOT blindly lazy-load everything.

Critical above-the-fold content should load immediately.

Non-critical content should load when necessary.

The dashboard should feel fast even on slower connections.

---

# 17. IMAGE OPTIMIZATION

Use the framework's optimized image system where applicable.

Images should:

* Use appropriate dimensions
* Use responsive sizes
* Use modern compressed formats where supported
* Avoid unnecessarily large source images
* Lazy-load non-critical images
* Be served efficiently
* Avoid layout shift

Do not convert every image to WebP blindly if doing so reduces quality or conflicts with the source/design requirements.

Optimize based on actual usage.

---

# 18. MOBILE REQUIREMENT

Mobile is a first-class requirement.

Test at minimum:

```text
Small mobile
Large mobile
Tablet
Desktop
Large desktop
```

Check:

* Navigation
* Typography
* Buttons
* Forms
* Tables
* Cards
* Admin dashboard
* Product pages
* Checkout/order flow
* Canvas animation
* Images
* Modals
* Horizontal overflow
* Touch interactions

No horizontal page overflow should exist unless explicitly intended.

---

# 19. SLOW INTERNET REQUIREMENT

Test the application using throttled network conditions, including simulated slow 3G.

Verify:

* Initial page remains usable.
* Loading states are clear.
* Images do not block the entire UI.
* API failures are handled gracefully.
* Requests are not duplicated unnecessarily.
* Large assets are not downloaded unnecessarily.
* Important content remains accessible.
* The application does not crash when requests are slow.

---

# 20. SENSITIVE DATA PROTECTION

Sensitive data must not be unnecessarily exposed in:

* HTML
* Client-side JavaScript
* Browser network responses
* Logs
* URLs
* Local storage
* Redux state
* Public API responses

Examples:

* Passwords
* Authentication tokens
* Service-role keys
* Database credentials
* Full payment information
* Unnecessary personal information

For payment information, never store raw card numbers unless the architecture explicitly requires a compliant payment provider workflow.

Admin screens should display only the minimum necessary PII.

Mask sensitive information where appropriate.

---

# 21. PHASE EXECUTION RULE

Implement the project phase-by-phase.

Do NOT implement future phases early unless required to make the current phase function correctly.

At the beginning of every phase:

1. Read required documentation.
2. Inspect current code.
3. Inspect Git status.
4. Inspect existing dependencies.
5. Identify dependencies needed for this phase.
6. Implement the phase.
7. Run appropriate tests/checks.
8. Fix issues caused by the phase.
9. Review security.
10. Review mobile/performance implications.
11. Show changed files.
12. Tell me exactly what was completed.
13. Tell me what I must manually do.
14. Give the exact Git commands.
15. STOP.

Do not automatically continue to the next phase.

---

# 22. GIT WORKFLOW

Every completed feature/phase must be committed.

Before committing:

```bash
git status
```

Review all changed files.

Do not commit:

```text
.env
.env.local
credentials
private keys
generated secrets
temporary files
debug files
unrelated changes
```

After verification:

```bash
git add .
git commit -m "<phase-specific conventional commit>"
git push origin <current-branch>
```

Use meaningful Conventional Commit messages.

Examples:

```text
feat(db): implement database schema and prisma configuration
feat(auth): implement firebase authentication and authorization
feat(api): add server validation and rate limiting
feat(ui): implement storefront foundation
feat(admin): implement secure admin dashboard
perf(web): optimize loading and caching
test(e2e): add authentication and admin security tests
chore(deploy): prepare production deployment
```

Never commit with vague messages such as:

```text
update
changes
fix stuff
done
```

---

# 23. PHASE 1 — DATABASE & ORM

## Objective

Implement the production database layer based strictly on the existing project documentation.

Read:

```text
docs/PROJECT_OVERVIEW.md
docs/TRD.md
docs/ARCHITECTURE.md
docs/SCHEMA.md
docs/AGENT_RULES.md
```

Tasks:

1. Inspect the existing Prisma configuration.
2. Inspect `prisma/schema.prisma`.
3. Implement the documented schema.
4. Do not invent fields or relationships.
5. Implement required models such as:

   * User
   * Address
   * Product
   * Order
   * OrderItem
   * Announcement
6. Add `deletedAt` to Product if required by the documented architecture.
7. Create the Prisma singleton in the correct application location.
8. Ensure development does not create unnecessary Prisma clients.
9. Verify database access is server-side only.
10. Verify `DATABASE_URL` cannot reach client-side code.
11. Add appropriate indexes based on actual query requirements.
12. Use transactions where required.
13. Validate schema consistency.

Before migration:

```bash
npx prisma validate
```

Then provide the exact migration command appropriate to the project's package structure.

Do not assume the migration command if the repository uses a workspace-specific Prisma setup.

### Output

Report:

* Files changed
* Schema implemented
* Security checks
* Validation result
* Exact migration command
* Manual steps required
* Git commands

STOP after Phase 1.

---

# 24. PHASE 2 — AUTHENTICATION & AUTHORIZATION

## Objective

Implement secure Firebase Authentication and the project's documented Supabase integration without creating two competing authentication systems.

Tasks:

1. Inspect existing Firebase configuration.
2. Install only required packages.
3. Configure Firebase Authentication.
4. Implement secure server-side authentication/session handling.
5. Implement:

   * Sign up
   * Sign in
   * Sign out
   * Password reset if required by project documentation
6. Use generic authentication errors.
7. Never expose private Firebase credentials.
8. Protect authenticated routes.
9. Protect `/admin`.
10. Verify the user's server-side role before allowing admin access.
11. Prevent client-side role spoofing.
12. Create secure authentication Server Actions/API endpoints.
13. Implement authentication rate limiting.
14. Implement appropriate session expiration/refresh behavior.
15. Verify unauthorized users cannot directly call admin operations.

### Admin requirement

Only verified administrators may access:

```text
/admin
```

and admin APIs/actions.

Hiding the Admin navigation link is NOT sufficient.

### Manual requirement

The first real administrator account/role may need to be configured manually through the project's trusted administrative process.

Never create a hardcoded admin password.

### Output

Report:

* Authentication architecture
* Files changed
* Protected routes
* Admin authorization mechanism
* Rate-limiting mechanism
* Environment variables required
* Manual Firebase/Supabase configuration steps
* Tests performed
* Git commands

STOP after Phase 2.

---

# 25. PHASE 3 — BACKEND VALIDATION, ACTIONS & RATE LIMITING

## Objective

Create secure backend business logic.

Tasks:

1. Install/configure Zod.
2. Create validators based on the actual schema.
3. Create server actions for required operations such as:

   * createProduct
   * updateProduct
   * deleteProduct
   * createOrder
4. Validate every input server-side.
5. Authenticate requests.
6. Authorize requests.
7. Apply rate limiting.
8. Use Prisma safely.
9. Prevent users from modifying records they do not own.
10. Prevent unauthorized product/admin operations.
11. Implement token-bucket rate limiting.
12. Implement read caching where appropriate.
13. Implement cache invalidation after mutations.
14. Prevent duplicate requests where possible.

### Token bucket

```text
Capacity: 10
Refill: 1 token every 2 seconds
```

### Output

Report:

* Validators
* Server Actions
* Rate limiter
* Cache strategy
* Cache invalidation strategy
* Security checks
* Tests
* Manual configuration
* Git commands

STOP after Phase 3.

---

# 26. PHASE 4 — FRONTEND FOUNDATION

## Objective

Build the visual foundation according to the real design system.

Read:

```text
docs/UI_UX.md
docs/UI_UX_DESIGN/
docs/PROJECT_OVERVIEW.md
docs/ARCHITECTURE.md
docs/AGENT_RULES.md
```

Tasks:

1. Inspect the existing Tailwind configuration.
2. Implement documented brand colors.
3. Configure typography.
4. Configure spacing.
5. Configure breakpoints.
6. Configure reusable design tokens.
7. Install/configure Redux Toolkit only where global client state is genuinely needed.
8. Create cart state.
9. Create user/session state only if required.
10. Create providers.
11. Build Navbar.
12. Build Footer.
13. Ensure the Admin navigation item is only visible to authorized users.
14. Use Server Components wherever possible.
15. Keep client components limited to interactive functionality.
16. Avoid unnecessary Redux usage for server state.

### Design quality

The final interface must not look like an AI-generated template.

Use the provided design references.

Do not invent random visual styles.

### Output

Report:

* Design system changes
* Components created
* State architecture
* Responsive behavior
* Accessibility checks
* Performance considerations
* Git commands

STOP after Phase 4.

---

# 27. PHASE 5 — STOREFRONT, ANIMATION & ADMIN

## Objective

Implement the actual product experience.

### Hero Canvas

If the project contains the documented animation frames:

```text
/public/frames/
```

implement the HeroCanvas according to the design requirements.

Requirements:

* Do not block the entire page while frames load.
* Prioritize the first required frame.
* Load remaining frames progressively where possible.
* Use `requestAnimationFrame`.
* Map scroll position to frame index.
* Avoid unnecessary redraws.
* Respect `prefers-reduced-motion`.
* Provide a fallback/static frame.
* Optimize mobile behavior.
* Do not download unnecessary assets for devices that cannot use them efficiently.

Do not use `Promise.all` blindly if it causes a large initial network burst.

Choose the loading strategy based on actual performance testing.

---

## Storefront

Implement only the pages defined by the project requirements, such as:

* Home
* Shop
* Product Detail
* Announcements
* Our Story

Requirements:

* Responsive
* Accessible
* Fast
* SEO-friendly where appropriate
* Server-rendered where beneficial
* Progressive loading
* Proper empty states
* Proper error states
* Proper loading states

---

## User Dashboard

Implement the documented dashboard functionality, such as:

* Order history
* Wishlist
* Saved addresses
* Cocoa points

Do not expose another user's information.

User-specific data must be authorized server-side.

Do not globally cache private user data.

---

# 28. ADMIN PANEL

The admin panel must be a professional, clean CMS-style interface.

It should allow administrators to manage the functionality documented by the project requirements.

Potential capabilities include:

* Homepage content
* Products
* Product categories
* Orders
* Customers
* Announcements
* Announcement scheduling
* Other editable content defined in the project requirements

Do not add unnecessary CMS features merely because they sound impressive.

Everything editable from the admin panel must have:

* Server-side authorization
* Server-side validation
* Audit-friendly behavior where appropriate
* Safe error handling
* Proper loading states
* Proper confirmation for destructive actions
* Soft delete where required
* Pagination for large datasets
* Search/filter where appropriate

### CRITICAL

Admin authorization must be checked on:

1. Route access
2. Server Actions
3. API endpoints
4. Database mutations

Never trust the client.

---

# 29. PHASE 6 — TESTING, OPTIMIZATION & DEPLOYMENT

## Build verification

Run the project's actual build command.

For a standard Next.js project:

```bash
npm run build
```

But first inspect `package.json` and use the repository's actual scripts.

Fix:

* TypeScript errors
* ESLint errors
* Build errors
* Runtime errors
* Invalid imports
* Environment configuration problems

Do not suppress errors just to make the build pass.

---

# 30. SECURITY TESTING

Verify:

### Authentication

* Invalid login
* Valid login
* Logout
* Session expiration
* Unauthorized access
* Generic errors

### Authorization

Test:

* Anonymous user → `/admin`
* Normal user → `/admin`
* Normal user → admin API/action
* Admin → `/admin`
* Admin → admin API/action

The normal user must not be able to bypass authorization by manually calling an endpoint.

### Input validation

Test malformed:

* Product input
* Order input
* User input
* Query parameters
* IDs

### Rate limiting

Verify the token bucket behaves as specified.

### Data exposure

Inspect:

* HTML
* Browser Network tab
* Client JavaScript
* API responses
* Local storage
* Cookies
* Redux/client state

Ensure secrets and unnecessary sensitive information are not exposed.

---

# 31. PERFORMANCE TESTING

Test:

* Desktop
* Mobile
* Slow 3G
* Large image assets
* Long lists
* Dashboard
* Admin panel
* Product pages
* Hero animation

Verify:

* No unnecessary requests
* No duplicate requests
* Images load progressively
* Non-critical components load later
* Above-the-fold content loads quickly
* No major layout shifts
* No unnecessary JavaScript shipped to the browser

---

# 32. DEPLOYMENT

Deployment target:

```text
Vercel
```

unless project architecture requires another platform.

Before deployment:

1. Verify production environment variables.
2. Verify `.gitignore`.
3. Verify no secrets are committed.
4. Verify database connection.
5. Verify Firebase production configuration.
6. Verify Supabase production configuration where applicable.
7. Verify Redis/Upstash configuration where applicable.
8. Verify allowed domains/origins.
9. Verify authentication redirect URLs.
10. Verify production cookies/session behavior.
11. Verify database migrations.
12. Verify build command.
13. Verify Node.js/runtime version.
14. Verify deployment configuration.

Provide the exact Vercel configuration based on the actual repository structure.

Do not invent environment-variable values.

---

# 33. MANUAL ACTIONS REQUIREMENT

At the end of EVERY phase, explicitly divide remaining work into:

## Automatic

Things Antigravity completed.

## Manual

Things I must do myself.

For example:

```text
MANUAL ACTIONS

1. Create Firebase project.
2. Enable Firebase Authentication.
3. Add authorized domains.
4. Create production environment variables.
5. Create NeonDB database.
6. Add DATABASE_URL to Vercel.
7. Configure Upstash Redis.
8. Configure Firebase production credentials.
9. Verify admin role using the trusted server-side process.
```

Only include manual actions that are actually required.

Do not invent credentials or values.

---

# 34. GIT REQUIREMENT AFTER EVERY PHASE

At the end of every phase, provide:

```bash
git status
git diff --stat
git add .
git commit -m "<exact conventional commit message>"
git push origin <current-branch>
```

Before giving the commit command:

* Check that no secrets are included.
* Check that unrelated files are not included.
* Check that generated files are appropriate.
* Check that the phase actually works.

---

# 35. FINAL PHASE GIT WORKFLOW

Only after Phase 6 passes:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

Before merging:

* Confirm `dev` is clean.
* Confirm build passes.
* Confirm security tests pass.
* Confirm mobile tests pass.
* Confirm slow-network tests pass.
* Confirm deployment configuration is ready.

Do not merge if critical tests fail.

---

# 36. FINAL RESPONSE FORMAT AFTER EACH PHASE

Always finish the phase with:

## Completed

List what was actually implemented.

## Files Changed

List actual files changed.

## Security Verification

List security checks actually performed.

## Testing

List tests actually run and their results.

## Manual Actions

List only actions I must perform manually.

## Git

Provide exact commands.

## Blockers

Clearly state anything preventing the next phase.

Then STOP.

---

# 37. ABSOLUTE RULES

Never:

* Invent project requirements.
* Invent database fields.
* Invent credentials.
* Invent API endpoints.
* Expose secrets.
* Trust client-side authorization.
* Store plaintext passwords.
* Store raw passwords.
* Implement admin security only in the UI.
* Return sensitive information unnecessarily.
* Disable security checks to make tests pass.
* Suppress TypeScript/ESLint errors without fixing the cause.
* Add unnecessary dependencies.
* Create unnecessary APIs.
* Create generic AI-looking UI.
* Replace the project's architecture without approval.
* Implement future phases without instruction.
* Commit secrets.
* Claim a test passed without actually running it.

Always:

* Inspect before modifying.
* Follow project documentation.
* Validate on the server.
* Authenticate before protected operations.
* Authorize before protected operations.
* Rate-limit sensitive operations.
* Cache carefully.
* Invalidate caches after mutations.
* Optimize images.
* Test mobile.
* Test slow networks.
* Protect sensitive data.
* Keep the Admin panel server-secure.
* Use meaningful Git commits.
* Report manual steps.
* Stop after each phase.

# 38. CODE QUALITY, OOP & ENGINEERING STANDARDS

The codebase must be production-quality, maintainable, readable, and consistent.

## 38.1 General Principles

Follow:

* SOLID principles where applicable
* DRY
* KISS
* Separation of Concerns
* Single Responsibility Principle
* Composition over unnecessary inheritance
* Strong typing
* Clear module boundaries
* Small, focused functions
* Reusable utilities
* Predictable data flow

Do not over-engineer simple functionality.

Do not create abstractions merely for the sake of using design patterns.

---

## 38.2 OOP REQUIREMENT

Use Object-Oriented Programming where it provides a clear architectural benefit.

Good candidates for classes include:

* Complex business services
* Repository abstractions
* External service clients
* Payment/service integrations
* Rate limiter implementations
* Complex domain logic
* Stateful utilities
* Adapters
* Strategy-based behavior

Prefer:

* Encapsulation
* Single responsibility
* Dependency injection where appropriate
* Interfaces for replaceable services
* Composition over deep inheritance
* Private implementation details

Avoid:

* Giant "God" classes
* Deep inheritance trees
* Classes containing unrelated functionality
* Static utility classes when simple functions are clearer
* Creating classes just to satisfy an OOP requirement

Next.js Server Components, Server Actions, React components, hooks, and simple utilities may remain functional when that is the idiomatic and cleaner solution.

The goal is **clean engineering**, not maximum number of classes.

---

# 38.3 NAMING CONVENTIONS

All names must be descriptive and readable.

Avoid:

```text
x
y
d
tmp
data1
obj
res
thing
foo
bar
```

unless the variable has an extremely small and obvious scope.

Prefer:

```text
userId
productId
orderItems
customerEmail
authenticationResult
productRepository
rateLimitResult
```

Boolean variables should communicate their meaning:

```text
isAuthenticated
isAdmin
hasPermission
isLoading
isDeleted
canEdit
```

Functions should describe an action:

```text
createProduct()
updateProduct()
deleteProduct()
getProductById()
validateOrder()
checkAdminPermission()
```

Classes should describe the responsibility:

```text
ProductService
OrderService
AuthenticationService
ProductRepository
RateLimiter
```

Constants should use clear names:

```text
MAX_LOGIN_ATTEMPTS
RATE_LIMIT_BUCKET_SIZE
TOKEN_REFILL_INTERVAL
```

Do not use unexplained magic numbers or strings.

---

# 38.4 TYPESCRIPT REQUIREMENTS

Use TypeScript strictly.

Prefer explicit types for:

* Function parameters
* Function return values where useful
* API responses
* Server Action results
* Database service boundaries
* External service responses
* Complex objects

Avoid:

```typescript
any
```

unless there is a documented technical reason.

If `any` is unavoidable:

1. Keep its scope minimal.
2. Add a comment explaining why.
3. Prefer `unknown` when appropriate.
4. Narrow the type safely before use.

Do not silence TypeScript errors with:

```typescript
@ts-ignore
@ts-nocheck
```

unless there is a documented and unavoidable reason.

Never use TypeScript suppression simply to make the build pass.

---

# 38.5 FUNCTION SIZE

Keep functions focused.

A function should generally perform one logical responsibility.

Avoid very large functions such as:

```text
authenticateAndValidateAndSaveAndSendEmailAndUpdateCacheAndLogEverything()
```

Split complex workflows into focused services/functions.

For example:

```text
authenticateUser()
validateUserInput()
authorizeUser()
createOrder()
invalidateOrderCache()
```

Complex workflows may then orchestrate these smaller operations.

---

# 38.6 ERROR HANDLING

Every production operation must have intentional error handling.

Do not use empty catch blocks:

```typescript
try {
   ...
} catch {
}
```

Do not expose raw errors to users.

Do not expose:

* Stack traces
* Database errors
* SQL errors
* Firebase internal errors
* Redis errors
* API credentials
* Internal implementation details

to the client.

---

# 38.7 ERROR CATEGORIES

Use appropriate error categories.

Where appropriate, distinguish between:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
RateLimitError
DatabaseError
ExternalServiceError
InternalServerError
```

The exact implementation should follow the project's existing architecture.

Do not create dozens of unnecessary custom error classes.

---

# 38.8 USER-FACING ERRORS

Users should receive safe, useful messages.

Examples:

```text
Invalid email or password.
```

```text
You do not have permission to perform this action.
```

```text
The product could not be found.
```

```text
Too many requests. Please try again later.
```

Do not expose internal implementation details.

---

# 38.9 SERVER-SIDE ERROR LOGGING

Unexpected errors should be logged server-side using the project's approved logging approach.

Logs must NOT contain:

* Passwords
* Authentication tokens
* API keys
* Database credentials
* Full payment information
* Sensitive personal information unless genuinely required

Log enough information to diagnose the problem without exposing secrets.

---

# 38.10 SERVER ACTION / API RESPONSE FORMAT

Use a consistent response/error structure throughout the application.

For example, where appropriate:

```typescript
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
```

Do not blindly introduce this exact structure if the existing project architecture already defines another consistent response format.

Follow the existing architecture when one exists.

---

# 38.11 VALIDATION

Validation must occur at the correct boundary.

Client:

```text
UX validation
```

Server:

```text
Security validation
Business validation
```

Database:

```text
Database constraints
```

Never trust client-side validation.

Use Zod or the project's approved validation library at server boundaries.

---

# 38.12 SECURITY + ERROR HANDLING

Authorization must happen before sensitive operations.

Preferred flow:

```text
Request
  ↓
Authentication
  ↓
Authorization
  ↓
Rate Limiting
  ↓
Input Validation
  ↓
Business Logic
  ↓
Database / External Service
  ↓
Cache Invalidation
  ↓
Safe Response
```

Adapt the exact order where the security architecture requires it, but never skip authentication, authorization, or server-side validation for protected operations.

---

# 38.13 CODE DUPLICATION

Avoid repeated business logic.

If the same logic appears repeatedly:

1. Identify whether it is genuinely shared.
2. Extract a reusable function/service only when appropriate.
3. Keep abstractions focused.

Do not create unnecessary abstraction layers for one-line operations.

---

# 38.14 COMMENTS

Write comments to explain:

* Why something is necessary
* Security decisions
* Non-obvious algorithms
* Architectural constraints
* Important tradeoffs

Do NOT write comments that simply restate the code.

Bad:

```typescript
// Increment counter
counter++;
```

Good:

```typescript
// Tokens refill continuously rather than resetting every minute,
// preventing burst traffic immediately after the rate-limit window.
```

---

# 38.15 CODE REVIEW BEFORE COMPLETING EACH PHASE

Before declaring a phase complete, review the changed code for:

### Readability

* Are names understandable?
* Are functions focused?
* Is the control flow easy to follow?

### Architecture

* Does each module have one responsibility?
* Is business logic separated from UI?
* Are database operations separated appropriately?
* Are external services isolated?

### OOP

* Are classes used where they provide genuine value?
* Are responsibilities encapsulated?
* Is inheritance avoided unless justified?
* Is composition preferred?

### Type Safety

* Any unnecessary `any`?
* Any suppressed TypeScript errors?
* Are external inputs validated?

### Error Handling

* Are expected errors handled?
* Are unexpected errors logged safely?
* Are users receiving safe messages?
* Are internal errors hidden?

### Security

* Is authentication checked?
* Is authorization checked?
* Is input validated server-side?
* Are secrets protected?
* Is sensitive data protected?

### Maintainability

* Is the code easy for another developer to understand?
* Is there unnecessary duplication?
* Is there unnecessary complexity?

Do not declare the phase complete until these checks have been performed.
